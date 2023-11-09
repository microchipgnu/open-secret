import { gql } from 'graphql-request';

export const getPostsQuery = gql`
  query MyQuery($accountId: String!) {
    dataplatform_near_social_feed_posts(
      where: { account_id: { _eq: $accountId } }
    ) {
      id
      content
    }
  }
`;