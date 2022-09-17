import React, {Fragment, useCallback, useEffect, useState} from 'react';
import './Shell.css';
import levels from '../levels';
import Game from './Game';

const header = 'student@covm:~/Documents/Untitled-Bead-Game - 1.0.0$ ';

const files: string[] = ['game', ...Object.keys(levels)];
const customFiles: string[] = [];

interface CommandsSet {
    commands: string[];
    index: number;
}

function Shell() {

    const [, setPreviousCommands] = useState<CommandsSet>({
        commands: [],
        index: 1
    });
    const [previousShellText, setPreviousShellText] = useState<string[]>([]);
    const [shellText, setShellText] = useState('');
    const [inGame, setInGame] = useState(false);
    const [levelsCompleted, setLevelsCompleted] = useState(0);
    const [currentLevel, setCurrentLevel] = useState<keyof typeof levels | undefined>(undefined);
    const [key, setKey] = useState(0);


    const addPreviousCommand = (previousCommand: string): void => {
        setPreviousCommands(prevState => {
            return {commands: prevState.commands.concat(previousCommand), index: prevState.commands.length + 1};
        });
    };

    const keypress = (event: KeyboardEvent) => {
        if (inGame && event.key === 'q') {
            setInGame(false);
            return;
        }
        if (inGame) {
            return;
        }

        if ((event.key >= 'a' && event.key <= 'z') || (event.key >= '0' && event.key <= '9') || [',', '.', '/', '\\', ' ', '_'].includes(event.key)) {
            setShellText(prevState => prevState + event.key);
        } else if (event.code === 'Backspace') {
            setShellText(prevState => prevState.length > 0 ? prevState.slice(0, -1) : prevState);
        } else if (event.code === 'Tab') {
            event.preventDefault();
            if (shellText.startsWith('./game ')) {
                const argument = shellText.match(/(?<=^.\/game\s+).+/)?.[0];
                if (argument === undefined) return;
                let possibilities = files.slice(0, levelsCompleted + 1);
                possibilities = possibilities.filter(value => value.startsWith(argument));
                if (possibilities.length === 1) setShellText(`./game ${possibilities[0]}`);
                return;
            }
        } else if (event.code === 'ArrowUp') {
            setPreviousCommands(prevState => {
                const state = {...prevState, index: prevState.index - (prevState.index <= 0 ? 0 : 1)};
                setShellText(state.commands[state.index] ?? '');
                return state;
            });
        } else if (event.code === 'ArrowDown') {
            setPreviousCommands(prevState => {
                const state = {
                    ...prevState,
                    index: prevState.index + (prevState.index + 1 > prevState.commands.length ? 0 : 1)
                };
                setShellText(state.commands[state.index] ?? '');
                return state;
            });

        } else if (event.code === 'Enter') {
            addPreviousCommand(shellText);
            if (shellText.trim() === './game new') {
                if (levelsCompleted === 0) {
                    setLevelsCompleted(1);
                }
                replyCommand('Done!');
                return;
            }
            if (shellText.startsWith('./game ') && !shellText.endsWith('help')) {
                const match = shellText.match(/[\w+./]+/gm)?.[1];
                if (match === undefined) return;
                if (!(match in levels) || !files.slice(0, levelsCompleted + 1).concat(customFiles).includes(match)) {
                    setPreviousShellText(prevState => [...prevState, `${header}${shellText}`].concat(['There was an error while loading.', ...checkCommand('./game')]));
                    setShellText('');
                    return;
                }
                setKey(prevState => prevState + 1);
                setCurrentLevel(match as keyof typeof levels);
                setPreviousShellText([]);
                setShellText('');
                setInGame(true);
                return;
            }
            if (shellText === 'clear') {
                setPreviousShellText([]);
                setCurrentLevel(undefined);
            } else {
                setPreviousShellText(prevState => [...prevState, `${header}${shellText}`].concat(checkCommand(shellText)));
            }
            setShellText('');
        }
    };

    const checkCommand = (text: string): string | string[] => {
        text = text.trim();
        if (text === 'help') {
            return ['This is a program originally implemented by Viliam Vadocz, and made available on the web with the help of Wouter Breedveld',
                'Try using ./game to run the program'];
        }

        if (text === '') {
            return [];
        }

        if (text === 'ls') {
            try {
                return files.slice(0, levelsCompleted + 1).concat(customFiles).reduce((previousValue, currentValue) => previousValue + '  ' + currentValue);
            } catch (error) {
                return [];
            }
        }

        if (text === './game') {
            return ['Usage:',
                '   game help                   - Show a big help message',
                '   game new                    - Create the first level',
                '   game [path_to_level]        - Play a level'];
        }

        if (text === './game help') {
            return ['What is this?',
                '   This is a level based puzzle game about mutating a chain of coloured beads using rules.',
                '   Each level has a goal chain, a starting chain, and a set of operations.',
                '   Each operation has a pre-condition and a post-condition. This determines where it can be used.',
                'How do I play?',
                '   Use the [ARROW KEYS] to select where to place the operation and which one to use.',
                '   Use [SPACE|ENTER] to confirm the operation',
                '   You can press [q] to quit the level',
                'How can I make my own level?',
                '   Each level is stored in a human-readable format.',
                '   First the characters and colors are defined each on a separate line.',
                '   This section ends with an empty line.',
                '   Then we have the goal and starting bead chains. These use the characters defined above.',
                '   You can have a maximum of 4 pre-condition beads and a maximum of 4 post-condition beads.',
                '   The operations should end with the character \'.\' on its own line'
            ];
        }

        return 'Unfortunately that command isn\'t enabled in this application';
    };

    const onGameDone = useCallback(() => {
        if (files.indexOf(currentLevel?.toString() ?? '') === levelsCompleted) {
            setLevelsCompleted(prevState => {
                return prevState + 1;
            });
        }
        setInGame(false);
    }, [currentLevel, levelsCompleted]);

    const dragHandler = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
    };

    const dropHandler = async (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        const data = event.dataTransfer?.files[0];
        const fileName = data.name;
        levels[fileName] = await data.text();
        customFiles.push(fileName);
        replyCommand(`Level ${fileName} added!`);
    };

    const replyCommand = (reply: string | string[]) => {
        setPreviousShellText(prevState => [...prevState, `${header}${shellText}`].concat(reply));
        setShellText('');
    };

    useEffect(() => {
        document.addEventListener('keydown', keypress, false);
        return () => document.removeEventListener('keydown', keypress, false);
    }, [keypress]);

    return (
        <Fragment>
            <div className="console" onDrop={dropHandler} onDragOver={dragHandler}>
                <pre className="user-input">
                    <Game key={key} level={currentLevel === undefined ? undefined : levels[currentLevel]}
                        onComplete={onGameDone}/>
                    {previousShellText.map(x => `${x}\n`)}
                    {inGame ? <></> : header}
                    {shellText}
                    {inGame ? <></> : <span className="cursor">█</span>}
                </pre>
            </div>
        </Fragment>
    );
}

export default Shell;
