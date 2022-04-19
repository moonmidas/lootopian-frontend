import React, { useState } from 'react';
import { useRefreshingEffect } from '../hooks/useRefreshingEffect';
import { JACKPOT_CONTRACT } from '../constants'
import ClaimRewards from '../components/ClaimRewards';

export default function Rewards({
        playersJackpotAmountFormatted,
        denomFormatted,
        lcdClient,
        playersJackpotAmount,
        address,
        totalTickets,
        gameOver,
        denom
    }) {

    const [fetchingNewData, setFetchingNewData] = useState();


    const [ticketsBalance, setTicketsBalance] = useState(0);
    const [ticketsBalanceFormatted, setTicketsBalanceFormatted] = useState("0");

    const [earningsFormatted, setEarningsFormatted] = useState("0");

    useRefreshingEffect((isRefreshing) => {
        setFetchingNewData(!isRefreshing);
        async function fetchAccountTickets() {
            let response;
            console.log("Fetching account tickets...")
            try {
                response = await lcdClient.wasm.contractQuery(JACKPOT_CONTRACT, {
                    "get_tickets_by_address": { "address": address }
                });
                setTicketsBalance(response.tickets);
                // ticketsBalance should have commas every 3 digits and rounded to 2 decimals
                let tickets = response.tickets.toLocaleString('en-US', {minimumFractionDigits: 0, maximumFractionDigits: 0});
                setTicketsBalanceFormatted(tickets);
                let earnings = response.earnings/1000000;
                let earningsToLocale = earnings.toLocaleString('en-US', {minimumFractionDigits: 4, maximumFractionDigits: 4});
                console.log("Earnings: " + earningsToLocale);
                setEarningsFormatted(earningsToLocale);
                setFetchingNewData(false);
            } catch (e) {
                console.log(e)
            } 
        }
        fetchAccountTickets();
    }, 3_000, []);


    return (
        <div className="nes-container is-dark is-centered">
            <p>Your tickets: <span className="nes-text is-error">{ticketsBalanceFormatted}</span></p>
            <p>Your earnings: <span className="nes-text is-error">{earningsFormatted} {denomFormatted}</span></p>
            {gameOver ? 
                <>
                    <ClaimRewards address={address} lcdClient={lcdClient} denom={denom} ticketsBalance={ticketsBalance} denomFormatted={denomFormatted}/>
                </> 
                : 
                <></>
            }
        </div>
    );
}
