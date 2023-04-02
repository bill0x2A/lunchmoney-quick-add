import Head from 'next/head';
import Image from 'next/image';
import React, { createRef, useEffect, useReducer, useState } from 'react';
import dayjs from 'dayjs';
import getSymbolFromCurrency from 'currency-symbol-map'
import styled from 'styled-components';

const MoneyAdder = styled.div`
    display: flex;
    flex-direction: row;
    flex-flow: row wrap;
    margin: 10px 0 30px 0;
    justify-content: space-between;
    gap: 15px;

    > button {
        display: inline-flex;
        margin: 0 5px 0 0;
        cursor: pointer;
        padding: 13px 20px;
        color: #000;
        background-color: #fff;
        border: 1px solid #404040;
    }
`;

const Gear = styled.div`
    font-size: 22px;
    cursor: pointer;
    justify-self: flex-end;
`;

const CategoryHeaderGroup = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;

    h3 {
        margin: 0;
        display: inline;
    }
`;

const DisplayButton = styled.button`
    padding: 5px 30px;
    margin: 0;
    box-shadow: 3px 3px 0 rgb(221,115,41);
    color: #000;
    background-color: #fff;
    border: 1px solid #404040;
`;

const HeaderContainer = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;

    h1 {
        margin: 10px 20px;
    }
`;

const CategoryHolder = styled.div`
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-between;
    margin: 20px 0;
`;

interface CategoryI {
    selected: boolean;
    dimmed: boolean;
}
const CategorySelector = styled.div<CategoryI>`
    display: inline-block;
    padding: 8px 12px;
    margin: 5px;
    font-size: 12px;
    cursor: pointer;
    background-color: ${(props: CategoryI) =>
        props.selected ? 'rgb(221,115,41)' : 'rgba(255, 205, 1, .20)'};
    border-radius: 8px;
    color: ${(props: CategoryI) => (props.dimmed ? '#909090' : '#202020')};
`;

const InputWrapper = styled.div`
    width: 100%;
    border: 1px solid #404040;
    font-size: 22px;
    border-radius: 5px;
    padding: 5px 10px;
    display: flex;
    flex-direction: row;
    align-items: center;
`;

const TheSingleStepper = styled.div`
    width: 40px;
    display: flex;
    flex-direction: column;
`;

const ValueChange = styled.div`
    background-color: ${(props) => props.selectedColor};
    width: 28px;
    height: 29px;
    color: #404040;
    text-align: center;
    border-radius: 8px;
    cursor: pointer;
`;

const AppContainer = styled.div`
    min-height: 100vh;
    padding: 0 0.5rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
`;

const MainContainer = styled.div`
    padding: 10px;
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    width: 100%;
    max-width: 400px;

    label {
        text-align: left;
        margin: 10px 0;
        font-weight: 600;
        width: 100%;
    }
`;

const Button = styled.button`
    width: 100%;
    background-color: #404040;
    color: #fff;
    padding: 20px 30px;
    margin: 20px auto;
    box-shadow: 3px 3px 0 rgb(221,115,41);
    border: none;
    border-radius: 10px;
    font-size: 20px;
    text-transform: uppercase;
    font-weight: 700;
    font-style: italic;
    cursor: pointer;
`;

const TinyField = styled.input`
    box-shadow: 3px 3px 0 rgb(221,115,41);
    border: 4px solid #404040;
    padding: 5px 10px;
    margin: auto 10px;
    display: inline;
    color: #404040;
    font-weight: 600;
    background-color: #fff;
    border-radius: 10px;
`;

const TinyButton = styled.button`
    background-color: #404040;
    color: #fff;
    padding: 5px 10px;
    margin: auto 10px;
    box-shadow: 3px 3px 0 rgb(221,115,41);
    border: 3px solid #404040;
    border-radius: 10px;
    display: inline-block;
    font-size: 16px;
    text-transform: uppercase;
    font-weight: 700;
    font-style: italic;
`;

const NumberInput = styled.input`
    font-size: 20px;
    border: none;
    width: 90%;
    margin: 0 0 0 10px;
    display: inline-block;

    &:focus {
        outline: none;
    }
`;

const TextInput = styled.input`
    font-size: 20px;
    border: none;
    width: 100%;
    margin: 10px 0;
    display: inline-block;
    border: 1px solid #404040;
    padding: 5px 10px;
    border-radius: 4px;

    &:focus {
        outline: none;
    }
`;

const DollarSign = styled.span`
    font-size: 22px;
`;

const SuccessHolder = styled.div`
    display: flex;
    flex-direction: row;
    color: green;
    justify-content: center;
`;

const Footer = styled.div`
    width: 100%;
    border-top: 1px solid #eaeaea;
    display: flex;
    justify-content: center;
    flex-direction: column;
    padding: 10px 0;
    align-items: center;

    p {
        font-size: 12px;
    }
`;

const FavoriteCategoriesHolder = styled.div`
    display: block;
    margin: 10px 0;
`;

const reducer = (state: any, action: any) => {
    if (
        state.categories.filter(
            (cat: LunchMoneyCategory) => cat.id === action.value.id
        ).length > 0
    ) {
        const filterCats = state.categories.filter(
            (currentFavorite: any) => currentFavorite.id !== action.value.id
        );
        return { categories: filterCats };
    } else {
        return {
            categories: [action.value, ...state.categories],
        };
    }
};

interface LunchMoneyCategory {
    id: number;
    name: string;
    description: null;
    is_income: boolean;
    exclude_from_budget: boolean;
    exclude_from_totals: boolean;
    updated_at: string;
    created_at: string;
    is_group: boolean;
    group_id: null | number;
}

const Home: React.FC = () => {
    const [authenticated, setAuthenticated] = useState<boolean>(false);
    const [amount, setAmount] = useState<number>();
    const [loading, setLoading] = useState<boolean>(false);
    const [showFavs, setShowFavs] = useState<boolean>(false);
    const [accessTokenInState, setAccessToken] = useState<string>('');
    const [success, setSuccess] = useState<boolean>(false);
    const [cats, setCats] = useState<Array<LunchMoneyCategory> | null>(null);
    const [currencies, setCurrencies] = useState<string[]>(['thb', 'gbp', 'usd', 'vnd']);
    const [chosenCurrency, setChosenCurrency] = useState<string>('vnd');
    const [error, setError] = useState<string>('');
    const [category, setChosenCategory] = useState<LunchMoneyCategory | null>(
        null
    );
    const [settings, showSettings] = useState<boolean>(false);
    const [negative, setNegative] = useState<boolean>(true);
    const [note, setNote] = useState<string>();

    const [noCategoryWarning, setNoCategoryWarning] = useState<boolean>(false);
    const amountRef = createRef<HTMLInputElement>();
    const accessRef = createRef<HTMLInputElement>();

    const favoriteCategories = { categories: [] };

    const [favCats, dispatch] = useReducer(reducer, favoriteCategories);

    const downloadCats = async (at: string) => {
        console.log('are we doing this?');

        await fetch('https://dev.lunchmoney.app/v1/categories', {
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + at,
            },
            method: 'GET',
        })
            .then((result) => result.json())
            .then((result: any) => {
                console.log('did we get anything?');
                setCats(result.categories);
            })
            .catch(() => {
                setError(
                    'Something went wrong downloading categories. You might check your network connection, or your API key'
                );
                setCats(null);
            });
    };

    useEffect(() => {
        //try to get localstorage
        if (localStorage.getItem('access_token') === null) {
            console.log('We need to ask for their accessToken');
            return;
        } else if (localStorage.getItem('access_token')) {
            setAccessToken(localStorage.getItem('access_token'));
        }
        // // get favorites if it exists in local storage
        // if (localStorage.getItem('favorites')) {
        //     setShowFavs(true);
        //     dispatch({
        //         type: 'setFavorites',
        //         value: JSON.parse(localStorage.getItem('favorites')),
        //     });
        // }
    }, []);

    useEffect(() => {
        //this is what we do AFTER they press the button to add the accesstoken to local state
        if (accessTokenInState.length === 0) {
            return;
        } else if (accessTokenInState.length > 1) {
            setAccessToken(localStorage.getItem('access_token'));
            setAuthenticated(true);
        }
    }, [accessTokenInState]);

    // Save favorites to local storage when they change
    useEffect(() => {
        localStorage.setItem('favorites', JSON.stringify(favCats.categories));
    }, [favCats]);

    useEffect(() => {
        //this is what we do when the accessToken is in state and
        //we want to download the categories
        if (accessTokenInState.length === 0) {
            return;
        }
        downloadCats(accessTokenInState);
    }, [accessTokenInState]);

    const addAccessTokenFromHTMLElement = async () => {
        if (accessRef.current !== null) {
            setAccessToken(accessRef.current.value);
            setAuthenticated(true);
            localStorage.setItem('access_token', accessRef.current.value);
        }
    };

    const insertTransaction = async () => {
        setLoading(true);

        if (amount === 0 || category === null) {
            setLoading(false);
            setNoCategoryWarning(true);
            return;
        } else {
            var now = dayjs();
            await fetch('https://dev.lunchmoney.app/v1/transactions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + accessTokenInState,
                },
                body: JSON.stringify({
                    debit_as_negative: true,
                    transactions: [
                        {
                            amount: negative ? `-${amount}` : amount,
                            category_id: category.id,
                            date: now.format('YYYY-MM-DD').toString(),
                            payee: 'Bill',
                            currency: chosenCurrency,
                            notes: note,
                        },
                    ],
                }),
            })
                .then((result) => result.json())
                .then((res) => {
                    console.log(res);
                    setLoading(false);
                    setAmount(0);
                    setSuccess(true);
                })
                .catch((err) => {
                    console.log(err);
                    setLoading(false);
                    setError('error when inserting transaction');
                });
        }
    };

    return (
        <AppContainer>
            <Head>
                <title>Ducky Dollars</title>
                <link rel="apple-touch-icon" href="/duck.png"></link>
                <link rel="shortcut icon" type="image/png" href="/duck.png"/>
            </Head>
            <MainContainer>
                <HeaderContainer>
                    <span>&nbsp;</span>
                    <h1>Ducky Dollars</h1>
                    <Gear onClick={() => showSettings(!settings)}>⚙️</Gear>
                </HeaderContainer>

                <Image src="/duck.png" alt="ducky" width={180} height={200} />

                {(!authenticated || settings) && (
                    <div style={{ width: '100%', margin: '20px 0' }}>
                        <h2>Settings:</h2>
                        <p>Use your own access token to get started.</p>
                        {accessTokenInState.length === 0 ? (
                            <div>
                                <TinyField
                                    placeholder='accesstoken'
                                    type='text'
                                    ref={accessRef}
                                />
                                <TinyButton
                                    onClick={() =>
                                        addAccessTokenFromHTMLElement()
                                    }
                                >
                                    Add
                                </TinyButton>
                            </div>
                        ) : (
                            <div>
                                <span>
                                    {accessTokenInState.substring(0, 20)}...
                                </span>
                                <TinyButton
                                    onClick={() => {
                                        localStorage.removeItem('access_token');
                                        setAccessToken('');
                                        setAuthenticated(false);
                                    }}
                                >
                                    Delete
                                </TinyButton>
                            </div>
                        )}
                    </div>
                )}
                {authenticated && !settings && (
                    <div>
                        {error.length > 0 &&
                            accessTokenInState.length !== 0 && <p>{error}</p>}
                        <label htmlFor='lineItem'>Cash Entry:</label>
                        <InputWrapper>
                            <TheSingleStepper>
                                <ValueChange
                                    onClick={() => setNegative(false)}
                                    selectedColor={!negative && 'rgb(221,115,41)'}
                                >
                                    +
                                </ValueChange>
                                <ValueChange
                                    onClick={() => setNegative(true)}
                                    selectedColor={
                                        negative && 'rgb(255, 144, 144)'
                                    }
                                >
                                    -
                                </ValueChange>
                            </TheSingleStepper>
                            <DollarSign>{getSymbolFromCurrency(chosenCurrency?.toUpperCase())}</DollarSign>
                            <NumberInput
                                id='lineItem'
                                ref={amountRef}
                                value={amount}
                                onChange={(
                                    e: React.FormEvent<HTMLInputElement>
                                ) =>
                                    setAmount(Number(e.currentTarget.value || 0))
                                }
                            />
                        </InputWrapper>
                        {currencies?.length > 0 && (
                            <FavoriteCategoriesHolder>
                                <h3>Currencies:</h3>
                                <CategoryHolder>
                                    {currencies.map((currency) => {
                                        return (
                                            <CategorySelector
                                                style={{ textTransform : 'uppercase' }}
                                                selected={
                                                    currency === chosenCurrency
                                                }
                                                key={currency}
                                                onClick={() =>
                                                    setChosenCurrency(currency)
                                                }
                                            >
                                                {currency}
                                            </CategorySelector>
                                        );
                                    })}
                                </CategoryHolder>
                            </FavoriteCategoriesHolder>
                        )}
                        <CategoryHeaderGroup>
                            <h3>Category</h3>
                            {/* <DisplayButton
                                onClick={() => setShowFavs(!showFavs)}
                            >
                                {showFavs
                                    ? 'Show All Categories'
                                    : 'Hide Categories'}
                            </DisplayButton> */}
                        </CategoryHeaderGroup>
                        {favCats.categories.length > 0 && showFavs && (
                            <FavoriteCategoriesHolder>
                                <h3>❤️Favorites:</h3>
                                <CategoryHolder>
                                    {favCats.categories.map((cat) => {
                                        return (
                                            <CategorySelector
                                                selected={
                                                    category.id === cat.id
                                                }
                                                key={cat.id}
                                                onClick={() =>
                                                    setChosenCategory(cat)
                                                }
                                            >
                                                {cat.name}
                                            </CategorySelector>
                                        );
                                    })}
                                </CategoryHolder>
                            </FavoriteCategoriesHolder>
                        )}
                        {cats !== null && !showFavs && (
                            <CategoryHolder>
                                {cats.map((catone, i) => (
                                    <CategorySelector
                                        key={i}
                                        value={catone.id}
                                        selected={
                                            category !== null &&
                                            category.id === catone.id
                                        }
                                        dimmed={
                                            category !== null &&
                                            category.id !== catone.id &&
                                            category !== null
                                        }
                                        onClick={() =>
                                            setChosenCategory(catone)
                                        }
                                    >
                                        {favCats.categories.filter(
                                            (cat) => cat.id === catone.id
                                        ).length > 0 && <span>😍</span>}
                                        {catone.name}
                                    </CategorySelector>
                                ))}
                            </CategoryHolder>
                        )}
                        <TextInput
                            type="text" placeholder="note"
                            value={note}
                            onChange={(e: React.FormEvent<HTMLInputElement>) => setNote(e.currentTarget.value)}
                        />
                        <Button onClick={() => insertTransaction()}>
                            Add Transaction
                        </Button>
                        {success && (
                            <SuccessHolder>
                                <p>Transaction added, quack quack</p>
                            </SuccessHolder>
                        )}
                    </div>
                )}
            </MainContainer>

            <Footer>
                duck duck dollar
            </Footer>
        </AppContainer>
    );
};

export default Home;