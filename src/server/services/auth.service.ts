import jwt from 'jsonwebtoken';
import UserModel from '../models/user.model';

// Mock bcrypt implementation (already included in the user model)
const bcrypt = {
  genSalt: async () => 'salt',
  hash: async (password: string) => `hashed_${password}`,
  compare: async (candidatePassword: string, hashedPassword: string) => 
    hashedPassword === `hashed_${candidatePassword}`
};

// Secret key for JWT
const JWT_SECRET = import.meta.env.VITE_JWT_SECRET;
const JWT_EXPIRES_IN = '7d'; // Token expiration time

/**
 * Service for authentication related operations
 */
export class AuthService {
  /**
   * Register a new user
   */
  static async registerUser(userData: any) {
    try {
      // Check if user with this email already exists
      const existingUser = await UserModel.findOne({ email: userData.email });
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Create a new user
      const user = new UserModel(userData);
      await user.save();

      // Generate JWT token
      const token = this.generateToken(user);
      
      return {
        token,
        user: this.sanitizeUser(user),
      };
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  /**
   * Login user
   */
  static async loginUser(email: string, password: string) {
    try {
      // Find user by email
      const user = await UserModel.findOne({ email });
      if (!user) {
        throw new Error('Invalid email or password');
      }

      // Check if password is correct
      // Cast user to any to allow access to the comparePassword method
      const isPasswordValid = await (user as any).comparePassword(password);
      if (!isPasswordValid) {
        throw new Error('Invalid email or password');
      }

      // Generate JWT token
      const token = this.generateToken(user);
      
      return {
        token,
        user: this.sanitizeUser(user),
      };
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  /**
   * Get user by ID
   */
  static async getUserById(userId: string) {
    try {
      const user = await UserModel.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }
      return this.sanitizeUser(user);
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  /**
   * Generate JWT token
   */
  static generateToken(user: any) {
    return jwt.sign(
      { 
        id: user._id,
        email: user.email,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
  }

  /**
   * Verify JWT token
   */
  static verifyToken(token: string) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  /**
   * Remove sensitive data from user object
   */
  static sanitizeUser(user: any) {
    const sanitizedUser = user.toObject ? user.toObject() : user;
    delete sanitizedUser.password;
    
    // Rename _id to id for consistency
    sanitizedUser.id = sanitizedUser._id;
    delete sanitizedUser._id;
    
    return sanitizedUser;
  }
}
