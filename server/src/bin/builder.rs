/**
 * This file is used to create new game boards and can be run using:
 * cargo run --bin builder. See get_letter_set for current method of
 * balancing letter types.
 */
use chrono::{Datelike, Duration};
use rand::seq::SliceRandom;
use rand::Rng;

pub fn get_random_letters(count: usize, min: usize, max: usize) -> String {
    let mut rng = rand::thread_rng();
    let letters: &[u8] = b"AEIOUTRSNHABCDEFGHIJKLMNOPQRSTUVWXYZ";
    (0..count)
        .map(|_| {
            let idx = rng.gen_range(min..max);
            letters[idx] as char
        })
        .collect()
}

pub fn get_square(board: &String, row: usize, col: usize) -> char {
    board.chars().nth(7 * row + col).unwrap()
}

fn display_board(board: String) {
    for row in 0..8 {
        for col in 0..8 {
            print!("{}", get_square(&board, row, col));
        }
        println!("");
    }
    println!("");
}

fn get_letter_set() -> Vec<u8> {
    let mut rng = rand::thread_rng();
    let mut board = String::new();

    let vowels = get_random_letters(5, 0, 5);
    let common = get_random_letters(4, 5, 10);
    let others = get_random_letters(7, 10, 36);

    let mut letters = format!("{}{}{}", vowels, common, others)
        .to_string()
        .into_bytes();
    letters.shuffle(&mut rng);
    letters
}

fn create_board() -> String {
    let mut board = String::new();
    let letter_set = get_letter_set();
    let s1: String = String::from_utf8(letter_set.clone()).unwrap();
    let letter_set = get_letter_set();
    let s2: String = String::from_utf8(letter_set.clone()).unwrap();
    let letter_set = get_letter_set();
    let s3: String = String::from_utf8(letter_set.clone()).unwrap();
    let letter_set = get_letter_set();
    let s4: String = String::from_utf8(letter_set.clone()).unwrap();

    for i in 0..4 {
        board.push_str(s1[i * 4..(i + 1) * 4].into());
        board.push_str(s2[i * 4..(i + 1) * 4].into());
    }

    for i in 0..4 {
        board.push_str(s3[i * 4..(i + 1) * 4].into());
        board.push_str(s4[i * 4..(i + 1) * 4].into());
    }
    board
}

fn main() {
    for i in 0..100 {
        let current_date = chrono::Utc::now() + Duration::days(i);
        let year = current_date.year();
        let month = current_date.month();
        let day = current_date.day();
        let board = create_board();
        // display_board(res.clone());
        println!(
            "INSERT INTO GAME (board, year, month, day) VALUES ('{}', {}, {}, {});",
            board, year, month, day
        );
    }
}
