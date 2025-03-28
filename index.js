import { graphql } from '@octokit/graphql';
import { request } from '@octokit/request';
import { generateGitHubAppJWT } from './jwt.js';
import LLM from './llm.js';
const llm_instant = new LLM();
const addDiscussionComment = `
  mutation AddDiscussionComment($discussionId: ID!, $body: String!) {
    addDiscussionComment(input: {discussionId: $discussionId, body: $body}) {
      comment {
        id
      }
    }
  }
`;

export default (app) => {
  app.log.info("JabRag has been loaded!");

  app.on("discussion.created", async (context) => {
    const discussionId = context.payload.discussion.node_id;
    const installationId = context.payload.installation.id;
    const jwtToken = generateGitHubAppJWT();

    // Request installation access token dynamically
    const { data } = await request("POST /app/installations/{installation_id}/access_tokens", {
      installation_id: installationId,
      headers: {
        authorization: `Bearer ${jwtToken}`,
        accept: "application/vnd.github+json",
      },
    });

    const graphqlWithAuth = graphql.defaults({
      headers: {
        authorization: `token ${data.token}`,
      },
    });

    try {
      await graphqlWithAuth(addDiscussionComment, {
        discussionId,
        body: "👋 Hi! Thank you for creating a discussion.",
      });
      app.log.info("Comment added to new discussion.");
    } catch (error) {
      app.log.error(`Error adding comment: ${error.message}`);
    }
  });

  app.on("discussion_comment.created", async (context) => {
    const discussionId = context.payload.discussion.node_id;
    const installationId = context.payload.installation.id;
    const commentBody = context.payload.comment.body;

    if (!commentBody.includes("@jabrag")) return;

    var ragBody = await llm_instant.answerQuestion(commentBody);
    const jwtToken = generateGitHubAppJWT();

    const { data } = await request("POST /app/installations/{installation_id}/access_tokens", {
      installation_id: installationId,
      headers: {
        authorization: `Bearer ${jwtToken}`,
        accept: "application/vnd.github+json",
      },
    });

    const graphqlWithAuth = graphql.defaults({
      headers: {
        authorization: `token ${data.token}`,
      },
    });

    try {
      await graphqlWithAuth(addDiscussionComment, {
        discussionId,
        body: '${ragBody}',
      });
      app.log.info("Response comment added.");
    } catch (error) {
      app.log.error(`Error adding response comment: ${error.message}`);
    }
  });
};
