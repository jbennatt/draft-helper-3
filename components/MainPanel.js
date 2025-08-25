import { useState } from "react"
import { Container, Row, Col } from 'react-bootstrap'
import ControlPanel from "./ControlPanel"
import MainList from "./MainList"
import PositionGrid from "./PositionGrid"
import {
    enrichPlayers, filterPlayers, filterByPos, filterBySearchName, filterByIncludeDrafted,
    initDraftedMap
} from "../functions/PlayerFunctions"
import { allPositions } from "../functions/PlayerLabelFunctions"
import { ManualModeText, YahooModeText, SleeperModeText } from "../functions/ControlPanelFunctions"
import { useCookies } from "react-cookie"
import { YahooPkceCookieKey, YahooTokenCookieKey } from "../services/YahooTokenService"
import { useInterval } from "../utils/utils"
import { getDraftedPlayerKeys } from "../services/YahooApiService"
import { getSleeperDraftedPlayers } from "../services/SleeperApiService"

export default function MainPanel({ players, lastUpdateDate, yahooLoggedIn }) {
    const [draftedMap, setDraftedMap] = useState(initDraftedMap(players))

    const [includeDrafted, setIncludeDrafted] = useState(false)
    const [inputMode, setInputMode] = useState(ManualModeText)
    const [manualMode, setManualMode] = useState(true)
    const [pickNum, setPickNum] = useState(1)
    const [numTeams, setNumTeams] = useState(12)
    const [draftPos, setDraftPos] = useState(4)
    const [searchValue, setSearchValue] = useState('')
    const [searchPos, setSearchPos] = useState(allPositions)

    const [playersTeams, setPlayersTeams] = useState({}) // initialize to empty array
    const [selectedTeam, setSelectedTeam] = useState('')

    // Yahoo state
    const [_, setYahooPkceCookie] = useCookies([YahooPkceCookieKey])
    const [yahooTokenCookie, setYahooTokenCookie] = useCookies([YahooTokenCookieKey])
    const [yahooDraftedPlayerKeys, setYahooDraftedPlayerKeys] = useState([])

    // Sleeper state
    const [sleeperUsername, setSleeperUsername] = useState('')
    const [sleeperDraftedPlayerIds, setSleeperDraftedPlayerIds] = useState([])

    const enrichedPlayers = enrichPlayers(players, draftedMap, pickNum, draftPos, numTeams, true)

    useInterval(() => {
        if (playersTeams[selectedTeam]) {
            if (inputMode === YahooModeText) {
                getDraftedPlayerKeys(yahooTokenCookie, setYahooTokenCookie,
                    playersTeams[selectedTeam], yahooDraftedPlayerKeys,
                    setYahooDraftedPlayerKeys, players, draftedMap, setDraftedMap, pickNum,
                    setPickNum)
            } else if (inputMode === SleeperModeText) {
                getSleeperDraftedPlayers(playersTeams[selectedTeam], sleeperDraftedPlayerIds,
                    setSleeperDraftedPlayerIds, players, draftedMap, setDraftedMap, pickNum,
                    setPickNum)
            }
        }
    }, 5 * 1000)

    return <div>
        <Container>
            <Row>
                <Col>
                    <ControlPanel
                        pickNum={pickNum} setPickNum={setPickNum}
                        lastUpdateDate={lastUpdateDate}
                        searchPos={searchPos} setSearchPos={setSearchPos}
                        searchValue={searchValue} setSearchValue={setSearchValue}
                        includeDrafted={includeDrafted} setIncludeDrafted={setIncludeDrafted}
                        draftPos={draftPos} setDraftPos={setDraftPos}
                        numTeams={numTeams} setNumTeams={setNumTeams}
                        inputMode={inputMode} setInputMode={setInputMode}
                        manualMode={manualMode} setManualMode={setManualMode}
                        playersTeams={playersTeams} setPlayersTeams={setPlayersTeams}
                        selectedTeam={selectedTeam} setSelectedTeam={setSelectedTeam}
                        yahooLoggedIn={yahooLoggedIn}
                        setYahooPkceCookie={setYahooPkceCookie}
                        yahooTokenCookie={yahooTokenCookie} setYahooTokenCookie={setYahooTokenCookie}
                        yahooDraftedPlayerKeys={yahooDraftedPlayerKeys} setYahooDraftedPlayerKeys={setYahooDraftedPlayerKeys}
                        allPlayers={players} setDraftedMap={setDraftedMap}
                        // New Sleeper props
                        sleeperUsername={sleeperUsername} setSleeperUsername={setSleeperUsername}
                        sleeperDraftedPlayerIds={sleeperDraftedPlayerIds} setSleeperDraftedPlayerIds={setSleeperDraftedPlayerIds}
                    />
                </Col>
            </Row>
            <Row>
                <Col md='auto'>
                    <MainList
                        players={filterPlayers(enrichedPlayers,
                            filterByPos(searchPos),
                            filterBySearchName(searchValue),
                            filterByIncludeDrafted(includeDrafted)
                        )}
                        draftedMap={draftedMap} setDraftedMap={setDraftedMap}
                        pickNum={pickNum} setPickNum={setPickNum}
                        draftPos={draftPos} numTeams={numTeams}
                        manualMode={manualMode}
                    />
                </Col>
                <Col>
                    <PositionGrid
                        players={filterPlayers(enrichedPlayers, filterByIncludeDrafted(includeDrafted))}
                        draftedMap={draftedMap} setDraftedMap={setDraftedMap}
                        pickNum={pickNum} setPickNum={setPickNum}
                        draftPos={draftPos} numTeams={numTeams}
                        manualMode={manualMode}
                    />
                </Col>
            </Row>
        </Container>
    </div>
}