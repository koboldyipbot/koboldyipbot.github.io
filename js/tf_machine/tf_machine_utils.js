import * as TFMachineBase from 'tfMachineBase';
import {saveCode, loadCode} from 'userConfig';
import {BASE_SVGS, drawSVGOnCanvas, getPart, getRandomPart} from 'svgUtils';

export const INVALID_CHARACTER_REGEX = /[^0-9a-zA-Z]/;
export const DIGIT_NUMBER_MAP = {};
export const VALID_DIGIT_STRING = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
for (let i = 0; i < VALID_DIGIT_STRING.length; i++) {
  DIGIT_NUMBER_MAP[VALID_DIGIT_STRING[i]] = i;
}

// audio.play().then breaks some sound-synced animations if user doesn't click
export async function playAudio(audio) {
  try {
    await audio.play();
  } catch (e) {
    // gobble - don't care if audio breaks
  }
}
