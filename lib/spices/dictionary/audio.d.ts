import { NeedleOptions } from 'needle';
/**
 * The result from the dictionary audio spice.
 * @see https://developer.wordnik.com/docs#!/word/getAudio
 */
export interface DictionaryAudioResult {
    commentCount: string;
    /** The provider of the audio. */
    createdBy: string;
    /** ISO timestamp of the creation of the audio. */
    createdAt: '2021-04-19T19:15:09.922+0000';
    id: string;
    /** The word being said in the audio. */
    word: string;
    /** Duration (in seconds) of the audio. */
    duration: number;
    audioType: string;
    attributionText: string;
    attributionUrl: string;
    /** The URL to the audio clip. */
    fileUrl: string;
}
/**
 * Get audio of the word being said.
 * Data provided by Wordnik.
 * @category Spice
 * @see https://www.wordnik.com/
 * @param word The word to define
 * @param needleOptions The options for the HTTP request
 * @returns The dictionary audio result
 */
export declare function dictionaryAudio(word: string, needleOptions?: NeedleOptions): Promise<DictionaryAudioResult[]>;
