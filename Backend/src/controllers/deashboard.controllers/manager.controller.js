import { userModel } from "../../models/user.model.js";

const getManagerDeashboard = async (req, res) =>{

   try {
      const userId = req.user?.userid || req.user?.id;
      const userRole = req.user.role;

      if(!userId){
        return res.status(401).json({message: "Authentication required"})
      }

      if(userRole == "admin"){
        const manager = await userModel.find({
          role: "manager"
        }).select("-password")

        return res.status(200).json({
          message: "All manager data",
          success: true,
          manager
        })
      }

      const manager = await userModel.findOne({
        _id: userId,
        role: "manager"
      }).select("-password");

      if(!manager){
        return res.status(404).json({
          success: false,
          message: "Manager not found"
        })
      }

      res.status(200).json({
        message: "manager deashboard data",
        success: true,
        manager
      })


    
   } catch (error) {
        console.error("Get Manager Dashboard Error", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
   }
}

export default getManagerDeashboard