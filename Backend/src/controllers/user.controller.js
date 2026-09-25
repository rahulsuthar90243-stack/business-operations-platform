import { userModel } from "../models/user.model.js";
import jwt from "jsonwebtoken";
import "dotenv/config";
import bcrypt from "bcrypt"

export const register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    const hashPass = await bcrypt.hash(password, 10);

    const user = await userModel.create({
      username,
      email,
      password: hashPass,
      role,
    });

    const token = jwt.sign(
      {
        id: user._id,
      },
      process.env.JWT_SECRET,
    );

    res.status(200).json({
      message: "User Register Successfully",
      user,
      token,
    });

  } catch (error) {
    console.log("Error: ", error);
    res.status(500).json({
      message: "Registration failed",
      error: error.message,
    });
  }
}


export const login = async (req, res) => {
    try {
    const {email, password} = req.body;

    if(!email || !password){
        return res.status(400).json({
            message: "Email and password are required."
        })
    }

    // user find
    const user = await userModel.findOne({ email });

    if(!user){
        return res.status(404).json({
            message: "User not found"
        });
    }

    // password compare
    const isPasswordMatch = await bcrypt.compare(password, user.password)

    if(!isPasswordMatch){
        return res.status(401).json({
            message: "Invalid password"
        })
    }

    // generate jwt

    const token2 = jwt.sign({
        userid: user._id,
        role: user.role
    }, process.env.JWT_SECRET)

    return res.status(200).json({
        message: "Login Successfully",
        user,
        token2
    })
        
    } catch (error) {
        console.log("Error", error)
        return res.status(500).json({
            message: "Login failed",
            error: error.message,
        })
    }
}