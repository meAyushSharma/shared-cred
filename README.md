<h1 align=center> CREDENTIAL MANAGER </h1>


#### **Credential Manager** is an application that lets you manager your digital credentials and signatures such as secrets, API keys, passwords in a familiar key-value pairs with sharing feature enabled using Relationship Based Access Control (ReBAC), along with storing images as well.
---        

https://github.com/user-attachments/assets/ecd4b8ba-11bf-47bc-9157-83e09c65f51d          

## Reason for building it?        

1. To manage digital credentials, and have a go-to tool, accessible in least clicks.       
2. To efficiently share credentials and manage them.        
3. To have a single place for all credentials.       
---     
## Why trust Credential Manager?         

1. End-To-End Encryption (E2EE) enabled with client-side decryption only, meaning only you can access and decrypt the credential value. (though, credential name is not encrypted).      
2. Ability to share individual credential with other users with specific access control:       
    a. Viewer : Can 'view' only.      
    b. Editor : Can 'view' and 'edit' only.      
    c. Author : Can ''view', 'edit' and 'delete' only.     
    > Note : Only you can 'share' the credential with others.     
3. More than just key-value credentials, you can store image credentials (=<1MB) via cloudinary.    
    > Note : Encryption is not applied to image credentials, admin can view them via cloudinary console.      
---       

> NOTE : You must download (export) your crypto-keys from dashboard, they are digital keys to your credentials as well as used and asked when you login in different browser, re-login, or change devices.     

## Features          

1. Smooth authentication using **Passkey** login, **Single-sign-on** with google, or via username-password.     
2. Download all your credentials in beautiful markdown format.       
3. Reset your password if needed.       
4. Resetting password during login via One-Time-Password with registered email.     
5. Export your crypto keys in a click, and use credential manager on any platform and still have access to your data without compromising security and privacy.      
6. View all the credentials shared with you in well structured manner and perform operation on them.      
---       
## Tech Stack implemented          

 **Backend** : Nodejs, Expressjs     
 **Frontend** : HTML/CSS/JS      
 **Important implementations** :      
    1. Cloudinary : for management of image credentials.      
    2. Nodemailer : for verifying users.    
    3. Permit.io : for decoupling authorization (available in docker image, not in this repository)      
    4. Simplewebauthn : for passkey authentication.        
**Database** : MongoDB      

---    


## Installation          

### A. Via Github repo:      

> Note : This method does not run 'Permit' service, though it does not affect the application.
1. Fork this repository.       
2. Clone the forked repository in your machine/computer.      
3. Ensure that you are on ```main``` branch.     
4. Follow the following steps:       
```sh
    cd to\your\cloned\repo       
    touch .env # this will create .env file          
    #after this, copy the contents from .env.example to newly created .env         
    npm install  # this will install all required dependencies       
    npm start # start the server      
```        
5. Now your server should be up and running at port 3005.     
> Note: With this implementation, we are not using 'Permit' service.      
<br>
<details>
<summary>What is Permit.io ?</summary>
<br>
Permit.io provides service to decouple authorization logic from main code base, means you can up-scale/down-scale authorization without affecting main codebase. <br>
Permit is used as a additional service, in this project, and it will not directly affect the code if implemented as mentioned. You can find it's implementation in <pre>permitAuthorization.js</pre> file in <pre>utils</pre> folder.<br>
For more details visit: https://docs.permit.io/ .      
</details><br>

### B. Via docker:       

1. Install and setup docker desktop and docker CLI from (docker official)[https://www.docker.com/get-started/].     
2. Run ```docker pull meayush/credential-manager:v1.0``` in terminal, this will pull docker image of this application in your machine.     
3. To run the service, you first need to setup 'permit' service, as it depends on it, this service is opensource.      
```sh   
    docker run -it -p 7766:7000 
    --env PDP_API_KEY=your_permit.io_secret_id_here 
    --env PDP_DEBUG=True 
    permitio/pdp-v2:latest
```       
4. Once the this container is up and running, run the main service by following:      
```sh   
# run this command with respective environment variables      
docker run -it -p 3005:3005 
-e PORT=3005 
-e BCRYPT_SECRET_KEY=some-integer-set-here 
-e JWT_SECRET_KEY=set-secret-key-here 
-e BCRYPT_SALT_ROUNDS=some-integer-here 
-e MONGO_URL=your_mongo_url_here 
-e GOOGLE_CLIENT_ID=your_google_client_id_here 
-e GOOGLE_CLIENT_SECRET=your_google_client_secret 
-e SESSION_SECRET=passport_secret-here 
-e PERMIT_API_KEY=your_permit.io_secret_id_here 
-e CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name_here 
-e CLOUDINARY_API_KEY=your_cloudinary_api_key 
-e CLOUDINARY_API_SECRET=your_cloudinary_api_secret 
-e COOKIE_SECRET=some-secret-here 
-e NODEMAILER_EMAIL_USER=your_gmail_to_contact_users_with 
-e NODEMAILER_EMAIL_PASS=app_password_for_above_mentioned_gmail 
meayush/credential-manager:v1.0
```           
<br>


### C. Run the application locally and build your own image:       

> Note : For this setup you need docker installed and set up.     
1. Ensure you have git-local branch forked and cloned, copy from ```.env.example``` and paste in newly created ```.env``` with right values and remove ```.env``` from ```.dockerignore``` file.         
2. Checkout on git-local branch by running ```git checkout git-local```.      
3. Run following commands:      
```sh
    docker build -t <local-image-name>:tag_optional . # this will create you image locally on your machine       
    docker compose up -d # this will run permit service (in background)        
    # now run the newly created image like B.4 (above mentioned), just change the image name from 'meayush/credential-manager:v1.0' to '<local-image-name>:tag_optional     
```      
4. Now your containers should be up and running.     

---    

## How does Encryption works here ?        
To provide encryption along with the facility to share with others while maintaining your privacy and security, combination of **Symmetric key distribution** and **Proxy re-encryption** is used.     
Flow of implementation :        
On client-side:        
1. A pair of crypto keys i.e. ```public-key``` and ```private-key``` is generated on signup only, and stored on indexDB of browser (client-side), only ```public-key``` is sent to server which CANNOT be used for decryption.           
2. Whenever a credential is created a ```symmetric-key``` is generated for that particular credential and credential-value is encrypted, now the ```symmetric-key``` is encrypted with ```public-key``` of user.      
3. Now both ```encrypted-symmetric-key``` and ```encrypted-credential-value``` is sent to server for processing and storing.     
> Note : In the entire process ```private-key``` has NEVER been sent to server.         
4. When user (owner) requests for credentials, all the ```encrypted-credentials``` along with respective ```encrypted-symmetric-keys``` are fetched from database, then ```encrypted-symmetric-key``` is deciphered on client-side using user's ```private-key```, this ```symmetric-key``` is further used to decipher ```encrypted-credential-value```.        
![Screenshot 2024-09-12 233508](https://github.com/user-attachments/assets/27408b8a-8ca2-4132-b311-2e21a051740b)        

           
5. When user 'Share' any particular credential, ```encrypted-symmetric-key``` of that credential along with ```public-key``` of member (whom is shared with) is fetched from database.      
6. This ```encrypted-symmetric-key``` is deciphered with user's ```private-key``` and then ```symmetric-key``` obtained is now encrypted using member's ```public-key``` and stored on database.      
7. When user requests for 'credentials shared with me', all the associated ```encrypted-symmetric-keys``` that were stored in point (6) are fetched, then deciphered using their own ```private-key```.       

> In this whole process ```private-key``` used for deciphering is NEVER shared with other(s) or ever reaches server. Admin or anyone can not view actual value of credentials as long as they do not have access to your crypto-keys.       

> Note : Permit.io integration is only available on docker image.     


---    
## Image gallery      

1. ![Screenshot 2024-09-13 010351](https://github.com/user-attachments/assets/d4da5333-50ed-4811-964d-554e58c2d5c0)

2. ![Screenshot 2024-09-13 011416](https://github.com/user-attachments/assets/41e13897-4413-4336-8ca2-eb25788bb39c)

3. ![Screenshot 2024-09-13 010749](https://github.com/user-attachments/assets/854cdc90-ca4c-4c37-9000-df07c5878391)

