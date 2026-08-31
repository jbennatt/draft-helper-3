import axios from "axios"
import levenshtein from "damerau-levenshtein"
import { filterByPos, filterPlayers } from "../functions/PlayerFunctions"
import { qb, wr, rb, te, pk, dst } from '../functions/PlayerLabelFunctions'

const SleeperApi = 'https://api.sleeper.app/v1'

// Cache the players list - only fetch once per session
let cachedPlayers = null
let cacheExpiry = null
const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours

const SleeperPosToMyPos = {
    'QB': qb,
    'RB': rb, 
    'WR': wr,
    'TE': te,
    'DEF': dst,
    'K': pk
}

export async function getSleeperUser(username) {
    try {
        const response = await axios.get(`${SleeperApi}/user/${username}`)
        return response.data
    } catch (error) {
        console.error('Error fetching Sleeper user:', error)
        throw error
    }
}

export async function getSleeperUserLeagues(userId, season = getCurrentNFLSeason()) {
    try {
        const response = await axios.get(`${SleeperApi}/user/${userId}/leagues/nfl/${season}`)
        return response.data
    } catch (error) {
        console.error(`Error fetching Sleeper leagues for ${season}:`, error)
        throw error
    }
}

function getCurrentNFLSeason() {
    return (new Date()).getFullYear()
}

export async function updateSleeperTeams(username, setPlayersTeams) {
    try {
        const user = await getSleeperUser(username)
        const leagues = await getSleeperUserLeagues(user.user_id)
        
        const myTeams = {}
        leagues.forEach(league => {
            const userRoster = league.roster_positions ? league : null
            if (userRoster) {
                myTeams[league.name] = {
                    leagueId: league.league_id,
                    draftId: league.draft_id,
                    userId: user.user_id
                }
            }
        })
        
        setPlayersTeams(myTeams)
    } catch (error) {
        console.error('Error updating Sleeper teams:', error)
    }
}

export async function getSleeperDraftedPlayers(teamInfo, sleeperDraftedPlayerIds, 
    setSleeperDraftedPlayerIds, allPlayers, draftedMap, setDraftedMap, pickNum, setPickNum) {
    
    try {
        const response = await axios.get(`${SleeperApi}/draft/${teamInfo.draftId}/picks`)
        const picks = response.data
        
        const playerIds = picks
            .filter(pick => pick.player_id)
            .map(pick => pick.player_id)
        
        const oldPlayerIds = sleeperDraftedPlayerIds
        const newPlayerIds = playerIds.filter(id => !oldPlayerIds.includes(id))
        
        if (newPlayerIds.length === 0) return
        
        // Only fetch player data for NEW picks, not all players
        const newSleeperPlayers = await getPlayersFromPlayerIds(newPlayerIds)
        
        const playersToBeDrafted = newSleeperPlayers.map(sleeperPlayer => {
            const playerName = `${sleeperPlayer.first_name} ${sleeperPlayer.last_name}`
            const playerPos = SleeperPosToMyPos[sleeperPlayer.position] || sleeperPlayer.position
            
            if (playerName.toLowerCase().includes('hollywood')) return 'Marquise Brown'
            
            const dlSteps = filterPlayers(allPlayers, filterByPos(playerPos)).map(myPlayer => {
                const dlDist = levenshtein(myPlayer.name, playerName).steps
                return [myPlayer.name, dlDist]
            })
            
            const bestFit = [...dlSteps].sort((left, right) => left[1] - right[1])
            return bestFit[0] ? bestFit[0][0] : playerName
        })
        
        playersToBeDrafted.forEach(player => draftedMap.set(player, true))
        
        setPickNum(pickNum + playersToBeDrafted.length)
        setSleeperDraftedPlayerIds(sleeperDraftedPlayerIds.concat(newPlayerIds))
        setDraftedMap(new Map(draftedMap))
        
    } catch (error) {
        console.error('Error fetching Sleeper draft picks:', error)
    }
}

async function getPlayersFromPlayerIds(playerIds) {
    if (playerIds.length === 0) return []
    
    try {
        // Check if we have cached players and they're still valid
        const now = Date.now()
        if (!cachedPlayers || !cacheExpiry || now > cacheExpiry) {
            console.log('Fetching fresh Sleeper players data...')
            const response = await axios.get(`${SleeperApi}/players/nfl`)
            cachedPlayers = response.data
            cacheExpiry = now + CACHE_DURATION
        } else {
            console.log('Using cached Sleeper players data')
        }
        
        return playerIds
            .map(id => cachedPlayers[id])
            .filter(player => player)
            
    } catch (error) {
        console.error('Error fetching Sleeper players:', error)
        return []
    }
}

// Optional: Clear cache manually if needed
export function clearSleeperPlayersCache() {
    cachedPlayers = null
    cacheExpiry = null
}