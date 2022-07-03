use log::info;

#[derive(Debug)]
pub struct Cell {
    pub row: u32,
    pub col: u32,
    pub letter: char,
}

#[derive(Debug)]
pub struct Board {
    pub rows: u8,
    pub cols: u8,
    pub board_size: u8,
    pub board: String,
}

impl Board {
    pub fn new(board: String) -> Board {
        let world = Board {
            rows: 8,
            cols: 8,
            board_size: 8,
            board: board,
        };
        world
    }
}

impl Board {
    pub fn swap_squares(&mut self, row1: u8, col1: u8, row2: u8, col2: u8) {
        let idx1: usize = (row1 * 8 + col1) as usize;
        let idx2: usize = (row2 * 8 + col2) as usize;
        info!(
            "Swapping: {} {} {} {}::::{} {}",
            row1, row2, col1, col2, idx1, idx2
        );
        if idx1 < 64 && idx2 < 64 {
            let v1: char = self.board.chars().nth(idx1).unwrap();
            let v2: char = self.board.chars().nth(idx2).unwrap();
            self.board.replace_range(idx1..(idx1 + 1), &v2.to_string());
            self.board.replace_range(idx2..(idx2 + 1), &v1.to_string());
        }
    }

    #[allow(dead_code)]
    #[cfg(build = "debug")]
    pub fn get_square(&self, row: usize, col: usize) -> char {
        self.board.chars().nth(7 * row + col).unwrap()
    }

    #[allow(dead_code)]
    #[cfg(build = "debug")]
    pub fn display_board(&self) {
        info!("\nCurrent board:");
        for row in 0..8 {
            for col in 0..8 {
                print!("{}", self.get_square(row, col));
            }
            println!("");
        }
        println!("");
    }

    pub fn is_in_bounds(&self, row: u8, col: u8) -> bool {
        if row <= self.board_size && col <= self.board_size {
            return true;
        }
        false
    }

    pub fn is_in_user_quadrant(
        &self,
        player_area: u8,
        row1: u8,
        col1: u8,
        row2: u8,
        col2: u8,
    ) -> bool {
        if player_area == 1 {
            if row1 < 4 && row2 < 4 && col1 < 4 && col2 < 4 {
                return true;
            }
        } else if player_area == 2 {
            if row1 < 4 && row2 < 4 && col1 >= 4 && col2 >= 4 {
                return true;
            }
        } else if player_area == 3 {
            if row1 >= 4 && row2 >= 4 && col1 < 4 && col2 < 4 {
                return true;
            }
        } else if player_area == 4 {
            if row1 >= 4 && row2 >= 4 && col1 >= 4 && col2 >= 4 {
                return true;
            }
        }
        false
    }

    pub fn is_valid_move(&self, row1: u8, col1: u8, row2: u8, col2: u8) -> bool {
        if (row1 as i32 - row2 as i32).abs() == 1 && col1 == col2 {
            return true;
        } else if (col1 as i32 - col2 as i32).abs() == 1 && row1 == row2 {
            return true;
        }
        false
    }

    pub fn play(&mut self, player_area: u8, row1: u8, col1: u8, row2: u8, col2: u8) -> bool {
        if self.is_in_bounds(row1, col1) && self.is_in_bounds(row2, col2) {
            if self.is_in_user_quadrant(player_area, row1, col1, row2, col2) {
                if self.is_valid_move(row1, col1, row2, col2) {
                    self.swap_squares(row1, col1, row2, col2);
                    return true;
                }
            }
        }
        false
    }

    pub fn get_board_as_2d_array(&mut self) -> [[char; 8]; 8] {
        let mut board_2d = [['-'; 8]; 8];
        let mut idx = 0;
        for row in 0..8 {
            for col in 0..8 {
                let c = &self.board[idx..idx + 1];
                let temp: Vec<char> = c.chars().collect();
                board_2d[row][col] = temp[0];
                idx += 1;
            }
        }
        board_2d
    }
}
