import { DocumentNode, gql } from "@apollo/client";

export interface FreeAgentMatchesData {
  freeAgentMatches: {
    matched_discord_users: {
      username: string;
      discriminator: string;
      twitter_name?: string;
      avatar?: string;
    }[];
    number_of_likes_received: number;
    liked_discord_ids: string[];
  };
}

export const FREE_AGENT_MATCHES: DocumentNode = gql`
  {
    freeAgentMatches {
      matched_discord_users {
        username
        discriminator
        avatar
      }
      number_of_likes_received
      liked_discord_ids
    }
  }
`;
