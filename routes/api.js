const express=require("express")
const router=express.Router()
const jwt=require("jsonwebtoken")
const User=require("../models/user")
const Client=require("../models/clientdata")
const mongoose=require("mongoose")
const multer=require("multer")
const fs=require("fs")
var dir = './uploads';

const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir);
        }
        callback(null, './uploads');
    },
    filename: function(req, file, cb) {
      cb(null, Date.now() + file.originalname);
    }
  });
const fileFilter = (req, file, cb) => {
    // reject a file
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
      cb(null, true);
    } else {
      cb(null, false);
    }
  };
  const upload = multer({
    storage: storage,
    limits: {
      fileSize: 1024 * 1024 * 5
    },
    fileFilter: fileFilter
  });
const db=MONGOATLAS_KEY
app.use(express.static('uploads'));
mongoose.connect(db,err=>{
    if(err){
        console.error("Error! "+err)
    }else{
        console.log('Connected to MongoDB')
    }
})

function verifyToken(req,res,next) {
    if(!req.headers.authorization){
        return res.status(401).send('Unauthorized Request')
    }
    let token = req.headers.authorization.split(" ")[1]
    if(token ==='null')
        return res.status(401).send('Unauthorized Request')
    let payload = jwt.verify(token,'bimilKey')
    if(!payload){
        return res.status(401).send('Unauthorized Request')
    }
    req.userId=payload.subject
    next()
}

router.get('/',(req,res)=>{
    res.send("From API route")
})

router.post('/register',(req,res)=>{
    let userData=req.body
    let user= new User(userData)
    user.save((error,registeredUser)=>{
        if(error){
            console.log(error)
        }else{
            let payload={subject:registeredUser._id}
            let token=jwt.sign(payload, 'bimilKey')
            res.status(200).send({token})
        }
    })
})

router.post('/login',(req,res)=>{
    let userData=req.body

    User.findOne({email: userData.email},(error, user)=>{
        if(error){
            console.log(error)
        }else{
            if(!user){
                res.status(401).send("Invalid Email")
            }else{
                if(user.password !== userData.password){
                    res.status(401).send("Invalid Password")
                }else{
                    let payload={subject:user._id}
                    let token=jwt.sign(payload, 'bimilKey')
                    res.status(200).send({token})
                }
            }
        }
    })
})


router.post("/data", upload.single('algaeImage'), (req, res, next) => {
    if(!req.file){
        res.send("Please Upload file")
    }else{
        req.body.algaeImage=req.file.filename
        let clientData=req.body
        let user= new Client(clientData)
        console.log(user)
        user.save((error,registeredClient)=>{
            if(error){
                console.log(error)
            }else{
                res.status(200).send(registeredClient)
                console.log("Request Successful")
            }
        })
    }
})

router.get('/people', verifyToken,(req,res)=>{
    Client.find({},(err,client)=>{
        if(err){
            console.log(err)
        }else{
                res.json(client)
            
            }
    })
})

router.delete('/people/:id',(req,res)=>{
    Client.findByIdAndDelete(req.params.id, function(err,deletedentry){
        if(err){
            res.send(err)
        }else{
            res.json(deletedentry)
        }
    })
})


module.exports=router
