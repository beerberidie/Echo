import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Base storage directory
const STORAGE_DIR = path.join(__dirname, '../../../storage');
const RECORDINGS_DIR = path.join(STORAGE_DIR, 'recordings');

// Ensure storage directories exist
if (!fs.existsSync(STORAGE_DIR)) {
  fs.mkdirSync(STORAGE_DIR, { recursive: true });
}

if (!fs.existsSync(RECORDINGS_DIR)) {
  fs.mkdirSync(RECORDINGS_DIR, { recursive: true });
}

/**
 * Get the user's storage directory
 * @param userId User ID
 * @returns Path to the user's storage directory
 */
export const getUserStorageDir = (userId: string): string => {
  const userDir = path.join(RECORDINGS_DIR, userId);
  
  // Create user directory if it doesn't exist
  if (!fs.existsSync(userDir)) {
    fs.mkdirSync(userDir, { recursive: true });
  }
  
  return userDir;
};

/**
 * Save a base64 audio file to storage
 * @param userId User ID
 * @param base64Data Base64 encoded audio data
 * @param fileExtension File extension (default: 'webm')
 * @returns Object with file information
 */
export const saveAudioFile = (
  userId: string,
  base64Data: string,
  fileExtension: string = 'webm'
): { filePath: string; fileName: string; fileUrl: string } => {
  try {
    // Remove data URL prefix if present
    const base64Audio = base64Data.replace(/^data:audio\/\w+;base64,/, '');
    
    // Generate a unique filename
    const fileName = `${uuidv4()}.${fileExtension}`;
    const userDir = getUserStorageDir(userId);
    const filePath = path.join(userDir, fileName);
    
    // Write the file
    fs.writeFileSync(filePath, Buffer.from(base64Audio, 'base64'));
    
    // Generate a relative URL for the file
    const fileUrl = `/api/recordings/audio/${userId}/${fileName}`;
    
    return {
      filePath,
      fileName,
      fileUrl
    };
  } catch (error) {
    console.error('Error saving audio file:', error);
    throw new Error('Failed to save audio file');
  }
};

/**
 * Get an audio file from storage
 * @param userId User ID
 * @param fileName File name
 * @returns Buffer containing the audio file
 */
export const getAudioFile = (userId: string, fileName: string): Buffer => {
  try {
    const filePath = path.join(getUserStorageDir(userId), fileName);
    
    if (!fs.existsSync(filePath)) {
      throw new Error('Audio file not found');
    }
    
    return fs.readFileSync(filePath);
  } catch (error) {
    console.error('Error getting audio file:', error);
    throw new Error('Failed to get audio file');
  }
};

/**
 * Delete an audio file from storage
 * @param userId User ID
 * @param fileName File name
 * @returns Boolean indicating success
 */
export const deleteAudioFile = (userId: string, fileName: string): boolean => {
  try {
    const filePath = path.join(getUserStorageDir(userId), fileName);
    
    if (!fs.existsSync(filePath)) {
      return false;
    }
    
    fs.unlinkSync(filePath);
    return true;
  } catch (error) {
    console.error('Error deleting audio file:', error);
    return false;
  }
};

/**
 * Delete all audio files for a user
 * @param userId User ID
 * @returns Boolean indicating success
 */
export const deleteAllUserAudioFiles = (userId: string): boolean => {
  try {
    const userDir = getUserStorageDir(userId);
    
    if (!fs.existsSync(userDir)) {
      return true;
    }
    
    const files = fs.readdirSync(userDir);
    
    for (const file of files) {
      fs.unlinkSync(path.join(userDir, file));
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting user audio files:', error);
    return false;
  }
};

export default {
  getUserStorageDir,
  saveAudioFile,
  getAudioFile,
  deleteAudioFile,
  deleteAllUserAudioFiles
};
