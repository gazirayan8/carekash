const User = require("../models/User");

exports.updateProfile = async (req, res) => {
  const { name, email, phone, address } = req.body;

  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (user.role === "clinic") {
      return res.status(403).json({ message: "Clinics cannot update profile via this route." });
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (address) user.address = address;

    await user.save();

    res.status(200).json({
      message: "Profile updated successfully.",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role
      }
    });

  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ message: "Server error." });
  }
};
