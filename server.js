var express = require('express')
var bodyParser = require('body-parser')
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var mongoose = require('mongoose');

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

dbUrl = 'mongodb+srv://gedas:psw@cluster0.lvinvy1.mongodb.net/?retryWrites=true&w=majority'

var Message = mongoose.model('Message',{
    name: String,
    message: String
})

app.get('/messages',(req,res)=>{
    Message.find({},(err,messages)=>{
     res.send(messages);   
    })
    
})
app.get('/messages/:user',(req,res)=>{
    var user = req.params.user
    Message.find({name: user},(err,messages)=>{
     res.send(messages);   
    })
    
})

app.post('/messages', async (req,res)=>{
    try {
        var message = new Message(req.body);
            var savedMessage = await message.save();
            console.log('Message saved'); 
            var censored = await Message.findOne({message: 'badword'})           
            if(censored){
                console.log('Censored word:', censored);
                await Message.deleteOne({_id: censored.id});                        ; 
            }else io.emit('message', req.body)
            res.sendStatus(200); 
    } catch (error){
        res.sendStatus(500); 
        return  console.log(error)   
    } finally {
        console.log("mesageegeggege")
    }                        
   
})



io.on('connection',(socket)=>{
    console.log('user connected')
})

mongoose.connect(dbUrl, (err)=>{
    console.log('Mongo db connected', err)
})

var server = http.listen(3000, ()=>{
    console.log('Server listening on port', server.address().port);
})

