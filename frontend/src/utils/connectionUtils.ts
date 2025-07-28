// src/utils/connectionUtils.ts
// --- Make sure to adjust these import paths to match your project structure ---
 // Adjust path

import type { User } from "../features/authentication/context/AuthenticationContextProvider";
import type { IConnection } from "../features/network/components/connection/Connection";

// Define the possible UI states for a connection relationship
// These names are chosen to be descriptive for the UI logic in About.tsx
export type ConnectionUIState =
  | 'own_profile'
  | 'none'
  | 'pending_sent' // AuthUser sent the request
  | 'pending_received' // AuthUser received the request
  | 'accepted';

// Define the output structure for clarity
export interface ConnectionInfo {
  status: ConnectionUIState;
  connection: IConnection | null;
}

/**
 * Determines the UI state for the relationship between an authUser and a profileUser,
 * based on a provided list of connections.
 * This logic is used by components like 'About' that need to find the relationship.
 * 
 * @param authUser The currently logged-in user.
 * @param profileUser The user whose profile/connection status is being viewed.
 * @param allConnections The list of connections for the authUser (fetched from API).
 * @returns An object containing the UI state and the relevant connection object.
 */
export function getConnectionInfoForProfile(
  authUser: User | null,
  profileUser: User | null,
  allConnections: IConnection[]
): ConnectionInfo {
  // --- Check for own profile ---
  if (!authUser?.id || !profileUser?.id || authUser.id === profileUser.id) {
    return { status: 'own_profile', connection: null };
  }

  // --- Find the specific connection between authUser and profileUser ---
  const relevantConnection = allConnections.find(conn =>
    (conn.author.id === authUser.id && conn.recipient.id === profileUser.id) ||
    (conn.author.id === profileUser.id && conn.recipient.id === authUser.id)
  );

  // --- If no connection exists ---
  if (!relevantConnection) {
    return { status: 'none', connection: null };
  }

  // --- Use the shared logic to determine the specific state ---
  // Pass the found connection and the ID of the logged-in user
  return getConnectionUIState(relevantConnection, authUser?.id);
}

/**
 * Determines the specific UI state based on a known connection object and the current authUser's ID.
 * This logic aligns with how Connection.tsx interprets status.
 * 
 * @param connection The specific IConnection object representing the relationship.
 * @param authUserId The ID of the currently logged-in user.
 * @returns An object containing the UI state and the connection object.
 */
export function getConnectionUIState(
  connection: IConnection,
  authUserId: number // ID of the currently logged-in user
): ConnectionInfo {
  // --- Align comparison with Connection.tsx using the Status enum ---
  // Assumes the API correctly serializes/deserializes the enum.
  if (connection.status === Status.ACCEPTED) {
    return { status: 'accepted', connection };
  }
  
  if (connection.status === Status.PENDING) {
    // --- Differentiate between sent/received pending requests ---
    if (connection.author.id === authUserId) {
      // The logged-in user is the author (sender) of the pending request
      return { status: 'pending_sent', connection };
    } else {
      // The logged-in user is the recipient of the pending request
      return { status: 'pending_received', connection };
    }
  }
  
  // --- Default fallback if status is unexpected ---
  // This covers cases where status might be an unknown value.
  return { status: 'none', connection: null };
}
