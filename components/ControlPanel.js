import { Container, Row, Col, Button, Dropdown, DropdownButton } from "react-bootstrap"
import {
    computeRound, computePickInRound, incrementPickNum, updateStringEvent, updateIntegerEvent,
    supportedNumTeams,
    ManualModeText,
    YahooModeText,
    SleeperModeText,
    handleInputMode,
    handleTeamSelect,
    LoginToYahooText,
    LoginToSleeperText
} from "../functions/ControlPanelFunctions"
import { positions } from "../functions/PlayerLabelFunctions"
import { SearchBar } from "./SearchBar"

export default function ControlPanel({ pickNum, setPickNum, numTeams, setNumTeams,
    draftPos, setDraftPos, searchPos, setSearchPos, lastUpdateDate, setSearchValue,
    includeDrafted, setIncludeDrafted,
    inputMode, setInputMode, manualMode, setManualMode, playersTeams, setPlayersTeams,
    selectedTeam, setSelectedTeam, yahooLoggedIn, setYahooPkceCookie,
    yahooTokenCookie, setYahooTokenCookie, yahooDraftedPlayerKeys, setYahooDraftedPlayerKeys,
    allPlayers, setDraftedMap,
    sleeperUsername, setSleeperUsername, sleeperDraftedPlayerIds, setSleeperDraftedPlayerIds
}) {

    const currentRound = computeRound(pickNum, numTeams)
    const currentPickInRound = computePickInRound(pickNum, numTeams)

    const getInputModeOptions = () => {
        const options = [
            <Dropdown.Item key={ManualModeText}>{ManualModeText}</Dropdown.Item>
        ]
        
        if (yahooLoggedIn) {
            options.push(<Dropdown.Item key={YahooModeText}>{YahooModeText}</Dropdown.Item>)
        } else {
            options.push(<Dropdown.Item key={LoginToYahooText}>{LoginToYahooText}</Dropdown.Item>)
        }
        
        if (sleeperUsername) {
            options.push(<Dropdown.Item key={SleeperModeText}>{SleeperModeText}</Dropdown.Item>)
        } else {
            options.push(<Dropdown.Item key={LoginToSleeperText}>{LoginToSleeperText}</Dropdown.Item>)
        }
        
        return options
    }

    return <Container fluid>
        <Row>
            <Col md='auto'>
                <h1>Round {currentRound}.{currentPickInRound}, Pick &#35;{pickNum}</h1>
            </Col>
            <Col md='auto'>
                <Button size='sm' disabled={!manualMode}
                    onClick={() => incrementPickNum(pickNum, setPickNum, 1)}
                    variant='danger'>
                    Add Pick
                </Button>
                <Button size='sm' disabled={!manualMode}
                    onClick={() => incrementPickNum(pickNum, setPickNum, -1)}
                    variant='danger'>
                    Takeaway Pick
                </Button>
            </Col>
            <Col md='auto'>
                <h5>Updated: {lastUpdateDate}</h5>
            </Col>
        </Row>
        <Row>
            <Col md='auto'>
                <SearchBar setSearchValue={setSearchValue} includeDrafted={includeDrafted} setIncludeDrafted={setIncludeDrafted} />
            </Col>
            <Col md='auto'>
                <DropdownButton size='sm' title={`Input Mode (${inputMode})`} onClick={event =>
                    handleInputMode(event, inputMode, setInputMode, setManualMode, setYahooPkceCookie, 
                        yahooTokenCookie, setYahooTokenCookie, setPlayersTeams, sleeperUsername, setSleeperUsername)
                } variant='secondary'>
                    {getInputModeOptions()}
                </DropdownButton>
            </Col>
            <Col md='auto'>
                <DropdownButton size='sm' title={`Position (${searchPos})`} onClick={event => updateStringEvent(event, setSearchPos, searchPos, positions)} variant='secondary'>
                    {positions.map(pos =>
                        <Dropdown.Item key={pos}>{pos}</Dropdown.Item>
                    )}
                </DropdownButton>
            </Col>
            <Col md='auto'>
                <DropdownButton size='sm'
                    title={`Draft Position (${draftPos})`} onClick={event => updateIntegerEvent(event, setDraftPos, draftPos)} variant='secondary'>
                    {
                        [...Array(numTeams).keys()].map(index =>
                            <Dropdown.Item key={index}>{index + 1}</Dropdown.Item>
                        )
                    }
                </DropdownButton>
            </Col>
            <Col md='auto'>
                <DropdownButton size='sm'
                    title={`Number of Teams (${numTeams})`}
                    onClick={event => updateIntegerEvent(event, setNumTeams, numTeams, supportedNumTeams)}
                    variant='secondary'>
                    {
                        supportedNumTeams.map(numTeams =>
                            <Dropdown.Item key={numTeams}>{numTeams}</Dropdown.Item>
                        )
                    }
                </DropdownButton>
            </Col>
            <Col md='auto'>
                <DropdownButton size='sm' disabled={manualMode}
                    title={`Team Selector${!manualMode ? ` (${selectedTeam})` : ''}`} variant='secondary'
                    onClick={event =>
                        handleTeamSelect(event, selectedTeam, playersTeams, setSelectedTeam,
                            yahooTokenCookie, setYahooTokenCookie, yahooDraftedPlayerKeys,
                            setYahooDraftedPlayerKeys, allPlayers, setDraftedMap, pickNum, setPickNum,
                            sleeperDraftedPlayerIds, setSleeperDraftedPlayerIds, inputMode)
                    }>
                    {
                        Object.keys(playersTeams).map(team =>
                            <Dropdown.Item key={team}>{team}</Dropdown.Item>
                        )
                    }
                </DropdownButton>
            </Col>
        </Row>
    </Container>
}