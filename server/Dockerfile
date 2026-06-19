FROM node:18-alpine
# all commands run from /app
WORKDIR /app 
# copy dependency list first for cache            
COPY package*.json ./
 # install only production packages    
RUN npm install --omit=dev 
# copy code after install for cache efficiency
COPY . .       
 # document that app uses port 3000          
EXPOSE 3000      
# start app when container runs       
CMD ["node", "server.js"] 