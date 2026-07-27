import pkceChallenge from "react-native-pkce-challenge";

export const PkceChallengeField = 'challenge'
export const PkceVerifierField = 'verifier'

export function getNewPcke() {
    const pkce = pkceChallenge()
    const remapped = {}
    remapped[PkceChallengeField] = pkce.codeChallenge
    remapped[PkceVerifierField] = pkce.codeVerifier
    return remapped
}