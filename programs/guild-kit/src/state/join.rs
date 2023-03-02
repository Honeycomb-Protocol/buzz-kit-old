use super::IndexedReference;
use anchor_lang::prelude::*;

#[account]
pub struct Invitation {
    /// the key to identify for the invitation
    pub invitation_id: Pubkey,

    // bump of seeds
    pub bump: u8,

    /// the key to identify which guild does it belong to
    pub guild: Pubkey,

    /// the key to identify which chief does it belong to
    pub invited_by: Pubkey,

    /// the key to identify which member does it belong to
    pub invited: IndexedReference,
}
impl Invitation {
    pub const LEN: usize = 99 + 8;

    pub fn set_defaults(&mut self) {
        self.invitation_id = Pubkey::default();
        self.bump = 0;
        self.guild = Pubkey::default();
        self.invited_by = Pubkey::default();
        self.invited = IndexedReference::default();
    }
}

#[account]
pub struct Request {
    /// the key to identify for the request
    pub request_id: Pubkey,

    /// bump of seeds
    pub bump: u8,

    /// the key to identify which guild does it belong to
    pub guild: Pubkey,

    /// the key to identify which member does it belong to
    pub requested_by: Pubkey,
}
impl Request {
    pub const LEN: usize = 97 + 8;

    pub fn set_defaults(&mut self) {
        self.request_id = Pubkey::default();
        self.bump = 0;
        self.guild = Pubkey::default();
        self.requested_by = Pubkey::default();
    }
}
