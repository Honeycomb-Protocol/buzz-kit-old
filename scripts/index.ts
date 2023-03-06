import { BuzzGuildKit, buzzGuildKitModule, GuildVisibility, JoiningCriteria, MemberRole } from './../packages/hpl-buzz-guild-kit/index';
import { honeycombProjectModule } from '@honeycomb-protocol/hive-control/modules/Project';
import { PublicKey } from '@solana/web3.js';
import { getDependencies } from './utils';

const buzzguild = async (
    action: string,
    network: "mainnet" | "devnet" = "devnet",
) => {
    const { honeycomb, deployments, setDeployments } = getDependencies(network, "guild_kit");

    const project = await honeycombProjectModule(honeycomb, new PublicKey("FpAkhhMbtkPV9mpectS9dPcSjeXrksA4bbDPwdK4bTQo"));
    honeycomb.use(project)

    await honeycomb.identity().loadDelegateAuthority();
    await honeycomb.project().loadMints();

    if (action === "create-kit") {
        try {
            const guildKit = await BuzzGuildKit.new(honeycomb);

            console.log(guildKit.response.signature, "TXID");
            setDeployments({
                ...deployments,
                guild_kit: {
                    ...deployments.guild_kit,
                    address: guildKit.guildKitAddress.toBase58()
                },

            });
        } catch (e) {
            console.log(e, "error");
        }
    } else {
        honeycomb.use(
            await buzzGuildKitModule(honeycomb, new PublicKey(deployments.guild_kit.address))
        );
        if (action === "create-guild") {
            const chiefNftMint = new PublicKey("2cNg4XLPWdkSBWGDDY562h7WpG4hJ5GtnYRbkbvBoU7g");
            try {
                const guild = await honeycomb.guildKit().create().guild({
                    chiefNftMint,
                    args: {
                        name: "Test Guild",
                        chiefRefrence: honeycomb.project().findMintReference(chiefNftMint),
                        joiningCriteria: JoiningCriteria.Anyone,
                        visibility: GuildVisibility.Public,
                    }
                });
                console.log(guild.guildAddress.toBase58(), "TXID");
                setDeployments({
                    ...deployments,
                    guild_kit: {
                        ...deployments.guild_kit,
                        guilds: [
                            ...(deployments.guild_kit.guilds || []),
                            {
                                address: guild.guildAddress.toBase58(),
                                chiefNftMint: chiefNftMint.toBase58(),
                            }
                        ]
                    }
                });
            } catch (e) {
                console.log(e, "error");
            }

        } else {
            const chiefNftMint = new PublicKey("2cNg4XLPWdkSBWGDDY562h7WpG4hJ5GtnYRbkbvBoU7g");
            const guilds = await honeycomb.guildKit().loadGuilds();
            const guild = Object.values(guilds)[0];

            switch (action) {
                case "update-info": {

                    const updateInfo = await guild.updateInfo({
                        args: {
                            name: "Test Guild 2",
                            joiningCriteria: JoiningCriteria.Anyone,
                            visibility: GuildVisibility.Public,
                            chiefRefrence: honeycomb.project().findMintReference(chiefNftMint),
                        },
                        chiefNftMint,
                        guild: guild.guildAddress,
                    });

                    console.log(updateInfo.response.signature, "TXID");
                    break;
                }

                case "update-roles": {
                    const updateRoles = await guild.updateRoles({
                        chiefNftMint,
                        guild: guild.guildAddress,
                        memberNftMint: chiefNftMint,
                        args: {
                            chiefRefrence: honeycomb.project().findMintReference(chiefNftMint),
                            memberRefrence: honeycomb.project().findMintReference(chiefNftMint),
                            role: MemberRole.Chief,
                        }
                    });

                    console.log(updateRoles.response.signature, "TXID");
                    break;
                }

                case "join-guild": {
                    const joinGuild = await guild.joinGuild({
                        guild: guild.guildAddress,
                        memberNftMint: chiefNftMint,
                        member: honeycomb.identity().publicKey,
                        args: {
                            newMemberRefrence: honeycomb.project().findMintReference(chiefNftMint),
                        }
                    });

                    console.log(joinGuild.response.signature, "TXID");
                    break;
                }

                case "create-invitation": {
                    const updateRoles = await guild.createInvitation({
                        chiefNftMint,
                        guild: guild.guildAddress,
                        chief: honeycomb.identity().publicKey,
                        member: honeycomb.identity().publicKey,
                        memberNftMint: chiefNftMint,
                        args: {
                            chiefRefrence: honeycomb.project().findMintReference(chiefNftMint),
                            newMemberRefrence: honeycomb.project().findMintReference(chiefNftMint),

                        }
                    });

                    console.log(updateRoles.response.signature, "TXID");
                    break;
                }

                case "accept-invitation": {
                    const updateRoles = await guild.acceptInvitation({
                        guild: guild.guildAddress,
                        chief: honeycomb.identity().publicKey,
                        member: honeycomb.identity().publicKey,
                        memberNftMint: chiefNftMint,
                        invitation: new PublicKey(""),
                        args: {
                            chiefRefrence: honeycomb.project().findMintReference(chiefNftMint),
                            newMemberRefrence: honeycomb.project().findMintReference(chiefNftMint),
                        }
                    });

                    console.log(updateRoles.response.signature, "TXID");
                    break;
                }

                case "create-request": {
                    const updateRoles = await guild.createRequest({
                        guild: guild.guildAddress,
                        member: honeycomb.identity().publicKey,
                        memberNftMint: chiefNftMint,
                        args: {
                            newMemberRefrence: honeycomb.project().findMintReference(chiefNftMint),
                        }
                    }
                    );

                    console.log(updateRoles.response.signature, "TXID");
                    break;
                }

                case "accept-request": {
                    const updateRoles = await guild.acceptRequest({
                        guild: guild.guildAddress,
                        member: honeycomb.identity().publicKey,
                        memberNftMint: chiefNftMint,
                        request: new PublicKey(""),
                        args: {
                            chiefRefrence: honeycomb.project().findMintReference(chiefNftMint),
                            newMemberRefrence: honeycomb.project().findMintReference(chiefNftMint),
                        }
                    });

                    console.log(updateRoles.response.signature, "TXID");
                    break;
                }
            }
        }
    }
};
// update-info
// create-guild 
// update-roles
buzzguild("update-roles", "devnet");