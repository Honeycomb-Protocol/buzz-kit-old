import { } from './../packages/hpl-buzz-guild-kit/index';
import { Honeycomb, identityModule } from '@honeycomb-protocol/hive-control';
import { PublicKey } from '@solana/web3.js';
import { getDependencies } from './utils';
import { createGuild, createGuildKit } from '../packages/hpl-buzz-guild-kit/operations';
import { GuildVisibility, JoiningCriteria, PROGRAM_ID } from '../packages/hpl-buzz-guild-kit/generated';

const buzzguild = async (
    action: string,
    network: "mainnet" | "devnet" = "devnet",
) => {
    const { connection, signer, setDeployments, deployments } =
        getDependencies(network, "guild_kit");

    const honeycomb = await Honeycomb.fromAddress(
        connection,
        new PublicKey("FpAkhhMbtkPV9mpectS9dPcSjeXrksA4bbDPwdK4bTQo")
    );
    honeycomb.use(identityModule(signer));
    await honeycomb.identity().loadDelegateAuthority();
    await honeycomb.loadMints()

    if (action === "create-kit") {
        try {

            const buzzGuildKit = await createGuildKit(honeycomb, {
                programId: PROGRAM_ID,
            });

            console.log(buzzGuildKit.response.signature, "TXID");
            setDeployments({
                ...deployments,
                kit: buzzGuildKit.guildKitAddress.toBase58(),

            });
        } catch (e) {
            console.log(e, "error");
        }
    }
    else if (action === 'create-guild') {

        const chiefNftMint = new PublicKey("2cNg4XLPWdkSBWGDDY562h7WpG4hJ5GtnYRbkbvBoU7g");
        try {

            const guild = await createGuild(honeycomb, {
                chiefNftMint,
                args: {
                    name: "ANIME COLLECTION",
                    chiefRefrence: honeycomb.findMintReference(chiefNftMint),
                    joiningCriteria: JoiningCriteria.Anyone,
                    visibility: GuildVisibility.Public,
                }
            });
            console.log(guild.response.signature, "TXID")
            setDeployments({
                ...deployments,
                guild: guild.guildAddress
            })
        } catch (e) {
            console.error(e, "GUILD ERROR")
        }


    }
};

buzzguild("create-guild", "devnet");