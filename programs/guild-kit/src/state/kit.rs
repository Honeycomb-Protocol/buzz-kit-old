use anchor_lang::prelude::*;

#[account]
pub struct GuildKit {
    /// the key to identify which project does it belong to
    pub kit_key: Pubkey,

    /// the key to identify which project does it belong to
    pub project: Pubkey,

    /// bump of seeds
    pub bump: u8,
}
impl GuildKit {
    pub const LEN: usize = 65 + 8;

    pub fn set_defaults(&mut self) {
        self.project = Pubkey::default();
        self.bump = 0;
    }
}
