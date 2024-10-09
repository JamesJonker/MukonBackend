import express, { json } from "express";
import fs from "fs";
import cors from "cors";
import { resolve } from "path";
import path from "path";
import { fileURLToPath } from 'url';

const app = express();

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {


})
.get("/requisition", getRequisitionData)
.post("/createReq", createRequisition)
.get("/searchFilter", searchFilter)
.post("/updateRequisition",updateRequisition )

app.listen(3000, () => {
    console.log("listening at: http://localhost:3000");
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const requisition = [];

const jsonFilePath = path.join(__dirname, 'assets', 'requisitions.json');

function getRequisitionData(req, res) {

    if (!fs.existsSync(jsonFilePath)) {
        console.log('JSON file does not exist. Creating a new one...');
        fs.writeFileSync(jsonFilePath, JSON.stringify([], null, 2));
      } else {
        const stats = fs.statSync(jsonFilePath);
        if (stats.size === 0) {
          console.log('JSON file is empty. Initializing with an empty array...');
          fs.writeFileSync(jsonFilePath, JSON.stringify([], null, 2));
        }
      }
    const stats = fs.statSync(jsonFilePath);

    if (stats.size === 0) {
      console.log('JSON file is empty. Initializing with empty object...');
      return "No requisitions found"
    }
    
    fs.readFile(jsonFilePath, 'utf8', (err, data) => {
        if (err) {
          console.error('Error reading JSON file', err);
          return data.status(500).json({ message: 'Error reading JSON file' });
        }
        res.json(JSON.parse(data));
      });
}

function createRequisition(req, res){

    // const existingIndex = jsonArray.findIndex(req => req.requisitionId === newRequisitionId);

    const newData = [req.body];
    const newRequisitionId = req.requisitionId;

    const stats = fs.statSync(jsonFilePath);

    if (stats.size === 0) {
      console.log('JSON file is empty. Initializing with empty object...');

      fs.writeFile(jsonFilePath, JSON.stringify(newData, null, 2), (err) => {
        if (err) {
          console.error('Error writing to JSON file', err);
          return res.status(500).json({ message: 'Error writing to JSON file' });
        }
        res.status(200).json({ message: 'JSON file updated successfully', data: newData });
      });
    }else{
    
        fs.readFile(jsonFilePath, 'utf8', (err, data) => {  
            let curList = JSON.parse(data);
            const newproduct = Object.assign({}, ...newData);
            console.log("data from readfile", data);
            const existingIndex = curList.find(req => req.requisitionId === newRequisitionId);
            if (existingIndex !== -1) {

                console.log("check newData : ", newproduct);
                curList.push(newproduct);

              } else {
                curList.push(newproduct);
              }

              fs.writeFile(jsonFilePath, JSON.stringify(curList, null, 2), (err) => {
                if (err) {
                  console.error('Error writing to JSON file', err);
                  return res.status(500).json({ message: 'Error writing to JSON file' });
                }
                res.status(200).json({ message: 'JSON file updated successfully', data: newData });
              });
            
      });
    }
    
}
function searchFilter(req, res){

    const { query } = req.query

    console.log("searchItem : req", query)


    
    //   res.json(results);

    fs.readFile(jsonFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading the JSON file:', err);
            return;
          }

          let valData = JSON.parse(data);
        //   this.requisitions = JSON.parse(data);  

        if (!query) {
            console.log("not query");
            return res.json(valData); // Return all data if no query is provided
          }
        

         console.log("requisitions : in search", valData);

        const result = valData.filter(item=>{
            console.log("filteritem",item.requisitionId)
            if(item.requisitionId === query){
                console.log("found item", item);
                return res.json(item);
            }
        })


    });

}

function updateRequisition(req, res){

    console.log("inside updateRequisition")
    const updatedRequisition = req.body;

    console.log("updateRequisition -- req", req.body);
    const requisitionId = updatedRequisition.requisitionId;

    fs.readFile(jsonFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading the JSON file:', err);
            return;
          }
          let requisitions = JSON.parse(data);

          console.log("updateRequisition -- requisition", requisition);

          const index = requisitions.findIndex(r => r.requisitionId === requisitionId);

          console.log('found item index', index);
      
          if (index === -1) {
            console.log('error 400')
            return res.status(404).send({ message: `Requisition with ID ${requisitionId} not found` });
          }

          console.log("requisitions[index]", requisitions[index])
          console.log("updatedRequisition", updatedRequisition)

      
          requisitions[index] = { ...requisitions[index], ...updatedRequisition };

          console.log("requisitions[index] --other", requisitions[index])

      
          fs.writeFile(jsonFilePath, JSON.stringify(requisitions, null, 2), 'utf8', (err) => {
            if (err) {
              console.error('An error occurred while writing the file:', err);
              return res.status(500).send('Error saving updated requisition');
            }
            console.log("something");
            res.send({ message: 'Requisition updated successfully' });
          });
        });

}
