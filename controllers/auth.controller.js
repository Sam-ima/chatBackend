import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import generateTokenAndSetCookie from "../utils/generateToken.js";

export const signup = async (req, res) => {
	try {

		console.log("request body signup",req?.body)

		const { fullName, username,email,password, confirmPassword } = req?.body?.inputs;
    
		console.log("full nae",fullName)

		if (password !== confirmPassword) {
			return res.status(400).json({ error: "Passwords don't match" });
		}
        //check if user exist in the database
		const user = await User.findOne({ email });
		console.log("user exist",user)

		if (user) {
			return res.status(400).json({ error: "Username already exists" });
		}

		console.log("hashing")

		// HASH PASSWORD HERE
		const salt = await bcrypt.genSalt(10);       //to not allow other to view the password
		const hashedPassword = await bcrypt.hash(password, salt);

		console.log("hased")

		// https://avatar-placeholder.iran.liara.run/

		const boyProfilePic = `https://avatar.iran.liara.run/public/boy?username=${username}`;
		// const girlProfilePic = `https://avatar.iran.liara.run/public/girl?username=${username}`;

		const newUser = new User({
			fullName,
			username,
			email,
			password: hashedPassword,
			profilePic: boyProfilePic ,
		});

		console.log("new user",newUser)

		if (newUser) {
			// Generate JWT token here
			generateTokenAndSetCookie(newUser._id, res);
			await newUser.save();

			res.status(201).json({
				_id: newUser._id,
				fullName: newUser.fullName,
				username: newUser.username,
				email:newUser.
				email,
				profilePic: newUser.profilePic,
			});
		} else {
			res.status(400).json({ error: "Invalid user data" });
		}
	} catch (error) {
		console.log("Error in signup controller", error);
		res.status(500).json({ error: "Internal Server Error" });
	}
};

export const login = async (req, res) => {
	try {
		const { email, password } = req.body;
		console.log(req?.body);
		console.log(req.body);
		const user = await User.findOne({ email });
		if(!user) return res.status(400).json({ error: "Invalid email" });

		const isPasswordCorrect = await bcrypt.compare(password, user.password);

		// juggad method
		// const isPasswordCorrect = password === user?.password;

		console.log(
			"is password",isPasswordCorrect
		)

		if (!user || !isPasswordCorrect) {
			return res.status(400).json({ error: "invalid password" });
		}

		generateTokenAndSetCookie(user._id, res);

		return res.status(200).json({
			_id: user._id,
			fullName: user.fullName,
			// username: user.username,
			email:user.email,
			// profilePic: user.profilePic,
		});
		
	} catch (error) {
		console.log("Error in login controller", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
};

export const logout = (req, res) => {
	try {
		res.cookie("jwt", "", { maxAge: 0 });
		res.status(200).json({ message: "Logged out successfully" });
	} catch (error) {
		console.log("Error in logout controller", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
};