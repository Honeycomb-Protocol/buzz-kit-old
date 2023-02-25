use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq)]
pub enum GuildVisibility {
    Public,
    Private,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq)]
pub enum MemberRole {
    Chief,
    Member,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq)]
pub enum JoiningCriteria {
    Anyone,
    Invitation,
    Requested,
}
