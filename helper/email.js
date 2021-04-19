const nodemailer = require('nodemailer');
const EmailTemplate = require('email-templates').EmailTemplate;
const path = require('path');
const Promise = require('bluebird');

function sendEmailToUser (obj) {
    const transporter = nodemailer.createTransport({
        service: process.env.GMAIL_SERVICE_NAME,
        auth: {
            user: process.env.GMAIL_USER_NAME,
            pass: process.env.GMAIL_USER_PASSWORD,
        },
    })
    return new Promise((resolve,reject) =>{
        transporter.sendMail(obj).then(result =>{
            console.log(result)
            resolve(result)
        }).catch(err =>{
            console.error(err)
            reject(err);
        })
    })
}

function sendEmail (templateName, contexts) {
    let template = new EmailTemplate(path.join(__dirname, 'email_templates', templateName));
    return new Promise((resolve,reject) =>{
        Promise.all(contexts.map((context) => {
            return new Promise((resolve, reject) => {
                template.render(context, (err, result) => {
                    if (err) reject(err);
                    else resolve({
                        email: result,
                        context,
                    });
                });
            });
        })).then(results =>{
            return Promise.all(results.map((result) => {
                return new Promise((resolve, reject) => {
                    sendEmailToUser({
                        to: result.context.email,
                        from: 'Me :)',
                        subject: result.email.subject,
                        html: result.email.html,
                        text: result.email.text,
                    }).then(status =>{
                        resolve(status);
                    }).catch(err =>{
                        reject(err);
                    })
                });
            })).then(finalResult =>{
                console.log("final :"+JSON.stringify(finalResult))
                resolve(finalResult)
            }).catch(err =>{
                reject(err)
            })
        });
    })
    
}

module.exports = { sendEmail }