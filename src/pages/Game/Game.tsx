
import React, { useEffect, useState } from 'react';
import styled from "styled-components";
import MainHeader from '../../Navigation/MainHeader';
import GameMainContainer from '../../components/Game/GameMainContainer';
import { Grid } from '../../models/Grid';
import { MergePattern, SetClicks, TileSet } from '../../controller';
import { CONTRACT_ABI, CONTRACT_ADDRESS } from '../../constants/moralisConstants';
import { useMoralis, useMoralisWeb3Api, useWeb3ExecuteFunction } from "react-moralis";
import { useParams } from 'react-router';
import GeneratePattern from '../../controller/GeneratePattern';
import { Tile } from '../../models/Tile';


const GameContainer = styled.div`
    flex: 1;
    height: 100vh;
    width: 100%;
`;

function Game() {
    const { game_type } = useParams();
    const MAX_LENGTH = 6;

    const web3 = useWeb3ExecuteFunction();

    const { authenticate, isAuthenticated, isAuthenticating, logout, Moralis, account } = useMoralis();

    const [game, setGame] = useState<Grid>({
        clicksLength: 1,
        grid: [],
        length: 4,
        level: 1,
        width: 4
    });
    const [roadPattern, setRoadPattern] = useState<Array<Array<Tile>> | null>(null);

    const testPattern = [
        {
            "activated": false,

        }
    ];


    const setupGame = async () => {
        const tempCoordinate: Array<{ x: number, y: number }> = [];
        let tilesFlat: any[] = [];
        let clicks = [
            15,
            10,
            5,
            16,
            8,
            22,
            29,
            16,
            8,
            22,
            10,
        ];

        clicks.map((data: number) => {
            tempCoordinate.push({
                x: Math.floor(data / MAX_LENGTH),
                y: data % MAX_LENGTH
            });
            tilesFlat.push([Math.floor(data / MAX_LENGTH), data % MAX_LENGTH]);
        });

        const initialPuzzle = TileSet(MAX_LENGTH, MAX_LENGTH);
        // generate pattern
        const pattern = GeneratePattern(TileSet(MAX_LENGTH, MAX_LENGTH), tempCoordinate);
        // attach z pattern
        setRoadPattern(pattern);
        // change pattern -> z pattern ZPattern()
        const newGame = {
            clicksLength: clicks.length,
            grid: MergePattern(initialPuzzle, pattern),
            length: MAX_LENGTH,
            width: MAX_LENGTH,
            level: 1
        }

        setGame(newGame);

        SetClicks({
            game: newGame,
            setState: setGame,
            tilesFlat: tilesFlat
        });
    }

    const handleFetchGame = async () => {
        await web3.fetch({
            params: {
                contractAddress: CONTRACT_ADDRESS,
                functionName: "puzzle",
                abi: CONTRACT_ABI,
                //TODO: edit ETH value
                msgValue: Moralis.Units.ETH(0.01),
            }
        })
            .then((response) => {
                console.log("test", response);
            })
            .catch(error => {
                console.log(error);
            });
    }

    useEffect(() => {
        if (game_type && game_type === 'demo') {
            setupGame();
        } else {
            handleFetchGame();
        }
    }, []);

    return (
        <GameContainer>
            <MainHeader
                btnName='Retry'
                url='game'
                onClick={() => {
                    setupGame();
                }}
            />
            {roadPattern &&
                <GameMainContainer
                    game={game}
                    pattern={roadPattern}
                    setGame={setGame}
                />

            }
        </GameContainer>
    );
}

export default Game;