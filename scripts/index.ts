import { BuzzGuildKit, buzzGuildKitModule, GuildVisibility, JoiningCriteria, MemberRole } from './../packages/hpl-buzz-guild-kit/index';
import { honeycombProjectModule } from '@honeycomb-protocol/hive-control/modules/Project';
import { PublicKey } from '@solana/web3.js';
import { getDependencies } from './utils';

const buzzguild = async (
    action: string,
    network: "mainnet" | "devnet" = "devnet",
) => {
    const { honeycomb, deployments, memberIdenityModule, chiefIdenityModule, setDeployments } = getDependencies(network, "guild_kit");

    const project = await honeycombProjectModule(honeycomb, new PublicKey("FpAkhhMbtkPV9mpectS9dPcSjeXrksA4bbDPwdK4bTQo"));
    honeycomb.use(project)

    await honeycomb.identity().loadDelegateAuthority();
    await honeycomb.project().loadMints();

    if (action === "create-kit") {
        try {
            const guildKit = await BuzzGuildKit.new(honeycomb, "testing ");

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
                        matrixId: "test",
                    }
                });
                console.log(guild.guildAddress.toBase58(), "Address");
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
            const memberNftMint = new PublicKey("HNiL45fy1nX42bUoU8Yj19CTZpzCHZxekAez5LxkVaaL");

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
                    honeycomb.use(memberIdenityModule);

                    const joinGuild = await guild.joinGuild({
                        guild: guild.guildAddress,
                        memberNftMint,
                        args: {
                            newMemberRefrence: honeycomb.project().findMintReference(memberNftMint),
                        }
                    });

                    console.log(joinGuild.response.signature, "TXID");
                    break;
                }

                case "remove-member": {
                    try {
                        honeycomb.use(chiefIdenityModule);

                        const joinGuild = await guild.removeMemberFromGuild({
                            guild: guild.guildAddress,
                            memberNftMint,
                            chiefNftMint,
                            member: memberIdenityModule.publicKey,
                            args: {
                                chiefMemberRefrence: honeycomb.project().findMintReference(chiefNftMint),
                                newMemberRefrence: honeycomb.project().findMintReference(memberNftMint),
                            }
                        });
                        console.log(joinGuild.response.signature, "TXID");
                    } catch (e) {
                        console.error(e, "error");
                    }
                    break;
                }

                case "create-invitation": {
                    try {
                        const create_invitation = await guild.createInvitation({
                            chiefNftMint,
                            guild: guild.guildAddress,
                            member: memberIdenityModule.publicKey,
                            memberNftMint: chiefNftMint,
                            args: {
                                chiefRefrence: honeycomb.project().findMintReference(chiefNftMint),
                                newMemberRefrence: honeycomb.project().findMintReference(memberNftMint),
                            }
                        });

                        console.log(create_invitation.response.signature, "TXID");
                        console.log(create_invitation.invitationAddress.toBase58(), "Invitation Address");
                    } catch (e) {
                        console.error(e, "error");
                    }

                    break;
                }

                case "accept-invitation": {
                    honeycomb.use(memberIdenityModule);
                    try {

                        const acceptInvitation = await guild.acceptInvitation({
                            guild: guild.guildAddress,
                            chief: chiefIdenityModule.publicKey,
                            memberNftMint: memberNftMint,
                            invitation: new PublicKey("CC4ZBZk2trfL5bNqNeFJNPYj5yjpkFUYwRyQBZBikTt5"),
                            args: {
                                newMemberRefrence: honeycomb.project().findMintReference(memberNftMint),
                            }
                        });

                        console.log(acceptInvitation.response.signature, "TXID");
                    } catch (e) {
                        console.error(e, "error");
                    }
                    break;
                }

                case "create-request": {
                    honeycomb.use(memberIdenityModule);

                    const updateRoles = await guild.createRequest({
                        guild: guild.guildAddress,
                        memberNftMint,
                        args: {
                            newMemberRefrence: honeycomb.project().findMintReference(memberNftMint),
                        }
                    });

                    console.log(updateRoles.response.signature, "TXID");
                    console.log(updateRoles.requestAddress.toBase58(), "pda");
                    break;
                }

                case "accept-request": {
                    try {

                        const updateRoles = await guild.acceptRequest({
                            guild: guild.guildAddress,
                            member: memberIdenityModule.publicKey,
                            memberNftMint,
                            chiefNftMint,
                            request: new PublicKey("WbGmPJGYTW8F1BfP7BLnaEmJjmxhAJ8xXrchS8kyc7e"),
                            args: {
                                chiefRefrence: honeycomb.project().findMintReference(chiefNftMint),
                                newMemberRefrence: honeycomb.project().findMintReference(memberNftMint),
                            }
                        });

                        console.log(updateRoles.response.signature, "TXID");
                    } catch (e) {
                        console.error(e, "error");
                    }
                    break;
                }
            }
        }
    }
};


// create-kit
// create-guild 
// update-info
// update-roles
// join-guild
// create-invitation
// accept-invitation 
// remove-member 
// create-request 
// accept-request
buzzguild("create-kit", "devnet");