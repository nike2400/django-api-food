import { Octokit } from '@octokit/rest';
import { OpenAI } from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});


// 再試行用の関数
const retryRequest = async (fn, retries = 3, delayMs = 1000) => {
  try {
    return await fn();
  } catch (error) {
    if (retries === 0 || error.code !== 'insufficient_quota') {
      throw error;
    }
    console.log(`Retrying request in ${delayMs} ms...`);
    await new Promise(resolve => setTimeout(resolve, delayMs));
    return retryRequest(fn, retries - 1, delayMs);
  }
};

async function reviewPullRequests(owner, repo) {
  try {
    // developmentブランチへのプルリクエストを取得
    const { data: pullRequests } = await octokit.pulls.list({
      owner,
      repo,
      base: 'development',
      state: 'open',
    });

    for (const pr of pullRequests) {
      console.log(`レビュー中: ${pr.title} (#${pr.number})`);

      // プルリクエスト内の変更ファイルを取得
      const { data: files } = await octokit.pulls.listFiles({
        owner,
        repo,
        pull_number: pr.number,
      });

      for (const file of files) {
        // ファイルの内容を取得
        const { data: fileContent } = await octokit.repos.getContent({
          owner,
          repo,
          path: file.filename,
          ref: pr.head.sha, // プルリクエストのHEAD SHAを使用
        });

        // Base64エンコードされたコンテンツをデコード
        const content = Buffer.from(fileContent.content, 'base64').toString('utf-8');

        // ChatGPTにコードレビューを依頼
        const response = await retryRequest(() => openai.chat.completions.create({
          model: 'gpt-3.5-turbo', // 無料枠で利用可能なモデル
          messages: [
            { role: 'user', content: `次のコードをレビューしてください:\n\n${content}` },
          ],
          max_tokens: 500,
        }));

        const comment = response.choices[0].message.content.trim();

        // GitHubにコメントを投稿
        await octokit.issues.createComment({
          owner,
          repo,
          issue_number: pr.number,
          body: `File: ${file.filename}\n\n${comment}`,
        });

        console.log("レビュー結果をプルリクエストにコメントしました。");
      }
    }
  } catch (error) {
    console.error('Error during code review:', error);
  }
}


// 使用例
reviewPullRequests('nike2400', 'django-api-food', 1);
