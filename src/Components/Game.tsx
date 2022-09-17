import React, {useEffect, useState} from 'react';
import Circle from './Circle';

interface gameObject {
    colors: Map<string, string>,
    target: string[];
    current: string[];
    transformations: Map<string[], string[]>
}

type gameInput = {
    level: string | undefined
    onComplete: () => void
}

function Game({level, onComplete}: gameInput) {
    const [gameObject, setGameObject] = useState<gameObject>({
        colors: new Map(),
        target: [],
        current: [],
        transformations: new Map()
    });
    const [topCursor, setTopCursor] = useState(0);
    const [botCursor, setBotCursor] = useState(0);
    const [operations, setOperations] = useState(0);
    const [complete, setComplete] = useState(false);

    useEffect(() => {
        if (level !== undefined) {
            const parts = level.split(/\r?\n\r?\n/g).map(value => value.trim().split(/\r?\n/g));

            const colors = new Map();
            for (const part of parts[0]) {
                const [index, color] = part.split(' ');
                colors.set(index, color);
            }

            const target = parts[1][0].split('');
            const current = parts[1][1].split('');

            const transformations = new Map();
            parts[2] = parts[2].slice(0, -1);
            for (const part of parts[2]) {
                const [from, to] = part.split(/\s*>\s*/);
                transformations.set(from.split(''), to.split(''));
            }
            setGameObject({colors, target, current, transformations});
            setOperations(0);
            setComplete(false);
        }
    }, [level]);

    useEffect(() => {
        if (compareArray(gameObject.current, gameObject.target) && gameObject.transformations.size > 0) {
            setComplete(true);
        } else setComplete(false);
    }, [gameObject, level, operations]);

    useEffect(() => {
        if (complete) {
            onComplete();
        }

    }, [complete]);

    const handleKey = (event: KeyboardEvent) => {
        if (!(gameObject.transformations.size > 0) || complete) return;
        if (event.code === 'ArrowUp') {
            if (botCursor <= 0) return;
            setBotCursor(prevState => prevState - 1);
        } else if (event.code === 'ArrowDown') {
            if (botCursor + 1 >= gameObject.transformations.size) return;
            setBotCursor(prevState => prevState + 1);
        } else if (event.code === 'ArrowLeft') {
            if (topCursor <= 0) return;
            setTopCursor(prevState => prevState - 1);
        } else if (event.code === 'ArrowRight') {
            if (topCursor + 1 >= gameObject.current.length) return;
            setTopCursor(prevState => prevState + 1);
        } else if (event.code === 'Enter' || event.code === 'Space') {
            const transformArray = [...gameObject.transformations.keys()][botCursor];
            if (gameObject.current.length - transformArray.length - topCursor >= 0 && compareArray(gameObject.current.slice(topCursor, topCursor + transformArray.length), transformArray)) {
                setOperations(prevState => prevState + 1);
                setGameObject(prevState => {
                    const current = [...prevState.current];
                    current.splice(topCursor, transformArray.length, ...prevState.transformations.get(transformArray) ?? []);
                    prevState = {...prevState, current};
                    return prevState;
                }
                );
            }
        }
    };

    useEffect(() => {
        document.addEventListener('keydown', handleKey, false);
        return () => document.removeEventListener('keydown', handleKey, false);
    }, [handleKey]);

    const render = (): JSX.Element => {
        try {
            return (
                level === undefined ?
                    <>
                    </>
                    :
                    complete ?
                        <>
                            <span>You solved the level in [{operations}] operations!</span><br/>
                            <span style={{fontSize: 'xx-large'}}>
                                {gameObject.target.map((currentValue, index) => <Circle
                                    key={index}
                                    color={gameObject.colors.get(currentValue)}/>)}
                            </span><br/>
                        </>
                        :
                        <span>
                            <span style={{fontSize: 'xxx-large'}}>
                                {gameObject.target.map((currentValue, index) => <Circle
                                    key={index}
                                    color={gameObject.colors.get(currentValue)}/>)}
                            </span><br/>
                            <span style={{fontSize: 'xxx-large'}}>
                                {gameObject.current.map((currentValue, index) => <Circle
                                    key={index}
                                    color={gameObject.colors.get(currentValue)}/>)}
                            </span><br/>
                            <span style={{fontSize: 'xxx-large'}}>{Array(topCursor).fill(<Circle color="000000"/>)}{
                                <span>⮝</span>}</span><br/>
                            <br/>
                        
                            <span style={{fontSize: 'xxx-large'}}>
                                {[...gameObject.transformations.keys()].map((key, index) => <>
                                    <span style={{
                                        transform: 'rotate(90deg)',
                                        display: 'inline-flex'
                                    }}>{index === botCursor ? '⮝' : <Circle color="000000"/>}</span>
                                    <span>{key.map((value, index) => <Circle key={index}
                                        color={gameObject.colors.get(value)}/>)}</span>
                                    <span>🠖</span>
                                    <span>{gameObject.transformations.get(key)?.map(value => <Circle
                                        key={index}
                                        color={gameObject.colors.get(value)}/>)}</span><br/>
                                </>
                                )}
                            </span><br/>
                        
                            <span style={{fontSize: 'xx-large'}}>[{operations}]</span><br/>
                        </span>
            );
        } catch (e) {
            if (e instanceof TypeError) return <></>;
            console.error(e);
            return <></>;
        }
    };

    return render();
}

function compareArray<T>(arr1: T[], arr2: T[]) {
    for (let i = 0; i < arr1.length; i++) {
        if (arr1[i] !== arr2[i]) return false;
    }

    return true;
}


export default Game;
