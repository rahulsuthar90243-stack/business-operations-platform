import { userModel } from "../../models/user.model.js";
const getAdminDeashboard = async (req, res) =>{

   try {
      const userId = req.user?.userid || req.user?.id;

      if(!userId){
        return res.status(401).json({message: "Authentication required"})
      }

      const admin = await userModel.findOne({
        _id: userId,
        role: "admin"
      }).select("-password");

      if(!admin){
        return res.status(404).json({
          success: false,
          message: "Admin not found"
        })
      }

      res.status(200).json({
        message: "Admin deashboard data",
        success: true,
        admin
      })


    
   } catch (error) {
		console.error("Get Admin Dashboard Error", error);
		return res.status(500).json({
			success: false,
			message: "Internal server error",
		});
   }
}

export default getAdminDeashboard