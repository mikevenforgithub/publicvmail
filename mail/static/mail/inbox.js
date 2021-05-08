document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}


//  SENDING EMAILS

 
function send_email() {

    var recipients = document.querySelector('#compose-recipients').value;
    var subject = document.querySelector('#compose-subject').value;
    var body = document.querySelector('#compose-body').value;

    //FETCHING TAKEN FROM COURSE SPECIFICS
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
          recipients: (recipients),
          subject: (subject),
          body: (body)
      })
    })
      .then(response => response.json())
      .then(result => {
          // Print result
          console.log(result);
        });
  load_mailbox('sent');
}

    
// VIEWING EMAILS

function load_mailbox(mailbox) {

  // SHOWING ONLY WHAT WE WANT TO SEE
  var email_view = document.querySelector('#emails-view');
  var compose_view = document.querySelector('#compose-view');

  email_view.style.display = "none";
  compose_view.style.display = "none";
  
  email_view.style.display = "block";
  compose_view.style.display = "none";

  email_view.innerHTML = '';
  email_view.innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  //GET REQUEST
  fetch(`/emails/${mailbox}`)
    .then(response => response.json())
    .then(emails => {

      if (emails.length == 0) {
        email_view.innerHTML = '<p style = "font-size: large; font-weight: bold;">This Mailbox is Empty</p>';
      }
      else {
        for (email in emails) {

          //SETTING VIEW PARAMETERS
          var mail = document.createElement("div");
          var sender = document.createElement('h3');
          var sub = document.createElement('p');
          var time = document.createElement('p');
          var id = document.createElement('p');

          id.innerHTML = emails[email]['id'];
          id.style.display = 'none';

          sender.innerHTML = emails[email]['sender'];
          if (emails[email]['subject'] == '') {
            sub.innerHTML = 'No Subject';
            sub.style.color = 'red';
          }
          else {
            sub.innerHTML = emails[email]['subject'];
          }

          time.innerHTML = emails[email]['timestamp'];
          mail.style.borderStyle = 'solid';
          mail.style.borderColor = 'black';
          mail.style.borderWidth = '1px';
          mail.style.marginBottom = '10px';

          if (emails[email]['read'] == true) {
            mail.style.backgroundColor = 'gray';
          }
          else {
            mail.style.backgroundColor = 'white';
          }
          
          mail.classList.add('container');
          mail.classList.add('mail');
          //STYLE
          sender.style.display = 'inline-block';
          sender.style.margin = '5px';
          sub.style.display = 'inline-block';
          sub.style.margin = '10px';
          time.style.display = 'inline-block';
          time.style.margin = '10px';
          time.style.float = 'right';
          time.style.color = 'blue';
          //INSERTING
          email_view.appendChild(mail);
          mail.appendChild(sender);
          mail.appendChild(sub);
          mail.appendChild(time);
          mail.appendChild(id);

          //CLICK ON EMAIL
          mail.addEventListener('click', () => load_email());
          sub.addEventListener('click', () => load_email());
          time.addEventListener('click', () => load_email());
          sender.addEventListener('click', () => load_email());
        }
      }
    }
    );
}


// VIEWING SINGLE EMAIL

function load_email() {
  event.stopImmediatePropagation();

  // SHOWING ONLY WHAT WE WANT TO SEE
  var emails_view = document.querySelector('#emails-view');
  var compose_view = document.querySelector('#compose-view');
  emails_view.style.display = 'none';
  compose_view.style.display = 'none';
  mail_view = document.querySelector('#emails-view');
  mail_view.style.display = 'block';

  var tar = event.target;
  console.log(tar.children);
  if (!(tar.tagName == 'DIV')) {
    tar = tar.parentElement;
  }
  var c = tar.children;
  var id = c[3].innerHTML;
  mail_view.innerHTML = '';

  //FETCHING FOR ID
  fetch(`/emails/${id}`)
    .then(response => response.json())
    .then(email => {
      
      //CREATING ELEMENT TO DISPLAY
      var div = document.createElement('div');
      div.classList.add('container');
      div.classList.add('jumbotron');
      var sub = document.createElement('h3');
      sub.innerText = email['subject'];
      var sender = document.createElement('h3');
      sender.innerText = `From: ${email['sender']}`;
      var body = document.createElement('p');
      body.innerText = email['body'];
      var time = document.createElement('p');
      time.innerText = email['timestamp'];
      
      //STYLING THE ELEMENT
      time.style.color = 'blue';
      body.style.padding = '15px';
      body.style.backgroundColor = 'gray';

      //DISPLAYING IT
      div.appendChild(sub);
      div.appendChild(sender);
      div.appendChild(time);
      mail_view.appendChild(div);
      mail_view.appendChild(body);

      
      if (email['read'] == false) {
        fetch(`/emails/${id}`, {
          method: 'PUT',
          body: JSON.stringify({
            read: true
          })
        })
      }

      var archive = email['archived'];

      // CREATING THE BUTTONS 

      var arc = document.createElement('button');
      var reply = document.createElement('button');

     
      // MAKING arc A TOGGLE TO ARCHIVE AND UNARCHIVE 

      if (archive) {
        arc.innerText = 'Unarchive';
      }
      else {
        arc.innerText = 'Archive';
      }

      reply.innerText = 'Reply';

      //SETTING BOOTSTRAP CLASSES
      arc.classList.add('btn-primary');
      arc.classList.add('btn');
      reply.classList.add('btn-primary');
      reply.classList.add('btn');


      //TOGGLE FUNCTION
      arc.addEventListener('click', () => {
        fetch(`/emails/${id}`, {
          method: 'PUT',
          body: JSON.stringify({
            archived: !archive
          })
        });
        load_mailbox('inbox');
      });

      //REPLY FUNCTION
      reply.addEventListener('click', () => {

        compose_email();

        document.querySelector('#compose-recipients').value = email['sender'];
        document.querySelector('#compose-body').value = `On ${email['timestamp']}, ${email['sender']} wrote: ${email['body']}`;

        if (email['subject'].search('Re:')) {
          document.querySelector('#compose-subject').value = email['subject'];
        }
        else {
          document.querySelector('#compose-subject').value = `Re: ${email['subject']}`;
        }
      });

      //INSERT THE TWO BUTTONS
      mail_view.appendChild(arc);
      mail_view.appendChild(reply);
    });
}



function search() {

  // SHOWING ONLY WHAT WE WANT TO SEE
  var email_view = document.querySelector('#emails-view');
  var compose_view = document.querySelector('#compose-view');

  email_view.style.display = "none";
  compose_view.style.display = "none";
  
  email_view.style.display = "block";
  compose_view.style.display = "none";

  email_view.innerHTML = '';
  email_view.innerHTML = `Search Result`;

  var searchbar = document.getElementById("searchb");
  var input = searchbar.value;

  //GET REQUEST
  fetch(`/emails/inbox`)
    .then(response => response.json())
    .then(emails => {

      if (emails.length == 0) {
        email_view.innerHTML = '<p style = "font-size: large; font-weight: bold;">This Mailbox is Empty</p>';
      }
      else {
        for (email in emails) {

          if (emails[email]["body"].includes(input)){

          //SETTING VIEW PARAMETERS
          var mail = document.createElement("div");
          var sender = document.createElement('h3');
          var sub = document.createElement('p');
          var time = document.createElement('p');
          var id = document.createElement('p');

          id.innerHTML = emails[email]['id'];
          id.style.display = 'none';

          sender.innerHTML = emails[email]['sender'];
          if (emails[email]['subject'] == '') {
            sub.innerHTML = 'No Subject';
            sub.style.color = 'red';
          }
          else {
            sub.innerHTML = emails[email]['subject'];
          }

          time.innerHTML = emails[email]['timestamp'];
          mail.style.borderStyle = 'solid';
          mail.style.borderColor = 'black';
          mail.style.borderWidth = '1px';
          mail.style.marginBottom = '10px';

          if (emails[email]['read'] == true) {
            mail.style.backgroundColor = 'gray';
          }
          else {
            mail.style.backgroundColor = 'white';
          }
          
          mail.classList.add('container');
          mail.classList.add('mail');
          //STYLE
          sender.style.display = 'inline-block';
          sender.style.margin = '5px';
          sub.style.display = 'inline-block';
          sub.style.margin = '10px';
          time.style.display = 'inline-block';
          time.style.margin = '10px';
          time.style.float = 'right';
          time.style.color = 'blue';
          //INSERTING
          email_view.appendChild(mail);
          mail.appendChild(sender);
          mail.appendChild(sub);
          mail.appendChild(time);
          mail.appendChild(id);

          //CLICK ON EMAIL
          mail.addEventListener('click', () => load_email());
          sub.addEventListener('click', () => load_email());
          time.addEventListener('click', () => load_email());
          sender.addEventListener('click', () => load_email());
        }
        }
      }
    }
    );
}
