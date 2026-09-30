import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, doc, addDoc, deleteDoc, onSnapshot, query, where } from 'firebase/firestore';

// Dataset extracted from the provided text files
const careerQuotesData = [
  {
    podcast_number: 1,
    podcast_title: "Christina Ortega: Academic Counselor Career Story",
    podcast_link: "https://soundcloud.com/what-to-be/christina-ortega-academic-counselor-transfer-coordinator-cabrillo-college?utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing",
    interviewee_name: "Christina Ortega",
    industry_sectors: ["Education", "Child Development", "Family Services"],
    transcript_excerpt_number: 1,
    transcript_excerpt_text: "I am a first generation college student, I was the first of my family to go to higher education. I didn't really have an option. I didn't know what community college was. I didn't know the different opportunities that I would have had. It was just go to a four year and this is what you're gonna study.",
    quote: "I am a first generation college student, I was the first of my family to go to higher education.",
    initial_code: "Highlights the challenges and lack of guidance for first-generation college students in understanding educational opportunities.",
    theme: "Choosing a Path",
    subtheme: "Navigating Education"
  },
  {
    podcast_number: 1,
    podcast_title: "Christina Ortega: Academic Counselor Career Story",
    podcast_link: "https://soundcloud.com/what-to-be/christina-ortega-academic-counselor-transfer-coordinator-cabrillo-college?utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing",
    interviewee_name: "Christina Ortega",
    industry_sectors: ["Education", "Child Development", "Family Services"],
    transcript_excerpt_number: 2,
    transcript_excerpt_text: "I definitely attribute to my high school counselor that helped guide me, but also, I wish I would have had me when I was in college; maybe it wouldn't have taken me so long. Or maybe someone would have sat down and said, “Wait, you're not doing well in these classes? What's going on here? Let's talk about it.” And so I think that's really where my heart is to help first generation students really find their path, but be that mentor because they don't have that at home. So I could be that person for them.",
    quote: "I wish I would have had me when I was in college... I think that's really where my heart is to help first generation students really find their path, but be that mentor.",
    initial_code: "Emphasizes the desire to mentor first-generation students, providing the support she wished she had during her own college journey.",
    theme: "Mentorship",
    subtheme: "Importance of Guidance"
  },
  {
    podcast_number: 1,
    podcast_title: "Christina Ortega: Academic Counselor Career Story",
    podcast_link: "https://soundcloud.com/what-to-be/christina-ortega-academic-counselor-transfer-coordinator-cabrillo-college?utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing",
    interviewee_name: "Christina Ortega",
    industry_sectors: ["Education", "Child Development", "Family Services"],
    transcript_excerpt_number: 3,
    transcript_excerpt_text: "My favorite day, and I think every counselor will speak to this as graduation. Or in the spring, when they're getting their acceptance letters, and they come running to you, or you get that email at 3am that they got accepted to Cal Poly is the best feeling in the world.",
    quote: "My favorite day... is graduation. Or in the spring, when they're getting their acceptance letters... is the best feeling in the world.",
    initial_code: "Describes the immense joy and reward of seeing students achieve their academic and career goals, especially during graduation and acceptance into universities.",
    theme: "Career Fulfillment",
    subtheme: "Impact and Reward"
  },
  {
    podcast_number: 1,
    podcast_title: "Christina Ortega: Academic Counselor Career Story",
    podcast_link: "https://soundcloud.com/what-to-be/christina-ortega-academic-counselor-transfer-coordinator-cabrillo-college?utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing",
    interviewee_name: "Christina Ortega",
    industry_sectors: ["Education", "Child Development", "Family Services"],
    transcript_excerpt_number: 4,
    transcript_excerpt_text: "I think before I started you read the catalog, you help students, you kind of forget about that, and you go on to the next one. But it's so much more than that. You really gain connections with the students, and check in on them and when they have a bad day or they're going through a really hard struggle. You take that home, and that's the part I didn't realize when I was in graduate school.",
    quote: "You really gain connections with the students, and check in on them and when they have a bad day or they're going through a really hard struggle. You take that home, and that's the part I didn't realize when I was in graduate school.",
    initial_code: "Reveals the unexpected emotional depth of counseling, where the struggles of students are carried home, highlighting the challenging emotional boundaries of the role.",
    theme: "Job Realities",
    subtheme: "Emotional Toll"
  },
  {
    podcast_number: 1,
    podcast_title: "Christina Ortega: Academic Counselor Career Story",
    podcast_link: "https://soundcloud.com/what-to-be/christina-ortega-academic-counselor-transfer-coordinator-cabrillo-college?utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing",
    interviewee_name: "Christina Ortega",
    industry_sectors: ["Education", "Child Development", "Family Services"],
    transcript_excerpt_number: 5,
    transcript_excerpt_text: "Do your research. I don't want to do another plug about Cabrillo, this is about me and not Cabrillo, but we have amazing career resources. Start doing your research, do informational interviews, go and talk to you know, if it's, you want to be a nurse or a doctor or an accountant or a recruiter. Find someone reach out to them on LinkedIn, ask them for a coffee date, or a 10 minute phone call and just pick their brain. What are the good parts of the job? What are the bad parts of the job? What was your own educational path, because major doesn't always equal career. And so just do your research. No one can tell you what you should be because you're gonna be very unhappy if that if that's what you're expecting. You need to find it yourself. Just do your research and try things; trial and error. That's the only way you're gonna figure it out.",
    quote: "Do your research... Find someone reach out to them on LinkedIn, ask them for a coffee date, or a 10 minute phone call and just pick their brain. What are the good parts of the job? What are the bad parts of the job? What was your own educational path, because major doesn't always equal career... Just do your research and try things; trial and error. That's the only way you're gonna figure it out.",
    initial_code: "Advises thorough research, informational interviews, and trial-and-error to find a fulfilling career path, emphasizing self-discovery over external expectations.",
    theme: "Career Decision-Making",
    subtheme: "Research and Exploration"
  },
  {
    podcast_number: 2,
    podcast_title: "Lauren Del Carlo: California Highway Patrol Officer Career Story",
    podcast_link: "https://soundcloud.com/what-to-be/officer-del-carlo",
    interviewee_name: "Lauren Del Carlo",
    industry_sectors: ["Public and Government Services"],
    transcript_excerpt_number: 1,
    transcript_excerpt_text: "So when you graduate from the academy, as an officer, you have to have it's called it's called braking. So you have four phases of training. So even though you graduate from the Academy, and you're an officer, you still have a lot to learn about the job, right? Because they can only teach you so much there this way you learn about real life scenarios and how to fill out paperwork, how to write reports better the process, you know, for booking people that you arrest had to take a traffic collision. Scene management, there's a lot that you have to learn when once you graduate the academy.",
    quote: "Even though you graduate from the Academy, and you're an officer, you still have a lot to learn about the job... you learn about real life scenarios and how to fill out paperwork, how to write reports better...",
    initial_code: "Describes the extensive post-academy training for police officers, highlighting the continuous learning required for real-life scenarios and practical duties.",
    theme: "Skill Development",
    subtheme: "On-the-Job Training"
  },
  {
    podcast_number: 2,
    podcast_title: "Lauren Del Carlo: California Highway Patrol Officer Career Story",
    podcast_link: "https://soundcloud.com/what-to-be/officer-del-carlo",
    interviewee_name: "Lauren Del Carlo",
    industry_sectors: ["Public and Government Services"],
    transcript_excerpt_number: 2,
    transcript_excerpt_text: "I always knew that I wanted to go into the criminal justice field because I did race get raised in a law enforcement family. My dad actually works for the department as well... I always knew that I wanted to go into the criminal justice field. I didn't know what exactly you know, I thought maybe law school, maybe FBI, also an officer, I didn't know exactly what agency I wanted to work for.",
    quote: "I always knew that I wanted to go into the criminal justice field because I did race get raised in a law enforcement family.",
    initial_code: "Details a lifelong interest in criminal justice, influenced by family, and the process of exploring various career avenues within the field.",
    theme: "Choosing a Path",
    subtheme: "Family Influence & Exploration"
  },
  {
    podcast_number: 2,
    podcast_title: "Lauren Del Carlo: California Highway Patrol Officer Career Story",
    podcast_link: "https://soundcloud.com/what-to-be/officer-del-carlo",
    interviewee_name: "Lauren Del Carlo",
    industry_sectors: ["Public and Government Services"],
    transcript_excerpt_number: 3,
    transcript_excerpt_text: "I think that collision investigations can be really complex. Sometimes if you have a lot of items that so like physical items of evidence, it actually goes you have to be like, you have to put things on. Like it's called Vizio, which is a program where you basically put out a sketch and a factual diagram of the collision scene. So it's like all the items of evidence, and you have to roll everything out and measure things. So I think that collision investigations are really complex, especially on big collision scenes involving multiple vehicles. And there's a lot of items of evidence. I think that's that's a new by surprise that it's a lot that goes into it. And people probably don't know that. But we do a lot of this plot time that's invested on these traffic collision reports that we write. And there's a lot of report writing, definitely. You got to be here to stay on top of your report writing. It's like, it's like in college, we have a bunch of essays. It's like that",
    quote: "I think that collision investigations can be really complex... there's a lot of report writing, definitely. You got to be here to stay on top of your report writing. It's like, it's like in college, we have a bunch of essays. It's like that",
    initial_code: "Highlights the surprising complexity of collision investigations and the extensive report writing involved, comparing it to college essays.",
    theme: "Job Realities",
    subtheme: "Unexpected Complexity"
  },
  {
    podcast_number: 2,
    podcast_title: "Lauren Del Carlo: California Highway Patrol Officer Career Story",
    podcast_link: "https://soundcloud.com/what-to-be/officer-del-carlo",
    interviewee_name: "Lauren Del Carlo",
    industry_sectors: ["Public and Government Services"],
    transcript_excerpt_number: 4,
    transcript_excerpt_text: "I think a lot of people think that we just do, like, take traffic collision reports and write tickets. So it's, I don't think it's true. Like we do a lot of different stuff. And that we are only on the freeway, right? So I'll stop people, like, let's say in the city of Watsonville, I'm driving through I see something, I stopped and they're like, Hey, what are you doing over here? This isn't the freeway. And I'm like, we're everywhere. We that's the beauty of the hydro. We have jurisdiction everywhere. Like we can go anywhere and everywhere. So that's the misconception is that oh, we just write tickets and you have a quota which we don't have a quota. That's untrue people. I have people tell me that. Yeah. So I would say that, that we don't do stuff outside of just staying on the freeway like we have to stay on the freeway. We're not allowed to go anywhere. That's not I go I'm in Santa Cruz County.",
    quote: "I think a lot of people think that we just do, like, take traffic collision reports and write tickets... we do a lot of different stuff... We have jurisdiction everywhere. Like we can go anywhere and everywhere.",
    initial_code: "Addresses common misconceptions about CHP officers, clarifying their diverse duties beyond traffic and their statewide jurisdiction.",
    theme: "Misconceptions",
    subtheme: "Role and Jurisdiction"
  },
  {
    podcast_number: 2,
    podcast_title: "Lauren Del Carlo: California Highway Patrol Officer Career Story",
    podcast_link: "https://soundcloud.com/what-to-be/officer-del-carlo",
    interviewee_name: "Lauren Del Carlo",
    industry_sectors: ["Public and Government Services"],
    transcript_excerpt_number: 5,
    transcript_excerpt_text: "I think to definitely stay out of trouble, right? You have background check. Try to always do the right thing. You don't want to have something come back and haunt you that you're not going to be able to pursue this career because you made a mistake, right? So always try to do the right thing. Get good grades. They look at that. Yeah, just basically always try to do the right thing. If possible. I know that we make mistakes and people that do the hiring process, understand that just try to be on the right path and be a good person. i dont know",
    quote: "I think to definitely stay out of trouble... Try to always do the right thing. Get good grades... just basically always try to do the right thing. If possible.",
    initial_code: "Advises aspiring law enforcement officers to maintain good conduct, get good grades, and always strive to do the right thing due to rigorous background checks.",
    theme: "Career Advice",
    subtheme: "Personal Conduct"
  },
  {
    podcast_number: 3,
    podcast_title: "Gavin Clark: Master of Biophysics & MD Student Career Story",
    podcast_link: "https://soundcloud.com/what-to-be/gavin-clark-master-of-biophysics-md-student-at-georgetown-university",
    interviewee_name: "Gavin Clark",
    industry_sectors: ["Health Services", "Sciences", "Medical Technology"],
    transcript_excerpt_number: 1,
    transcript_excerpt_text: "Medical doctor student, I like that. That's what MD stands for, yeah? Yeah, yeah, medical doctor, MD. Yeah, we usually abbreviate it, med student, you know? Med student, yeah, that sounds a lot nicer. We'll do that. Okay. So as a med student, yeah, a day, just what it's like. It's, it is more work than you ever thought you would have to do. And it is Exclusively stuff that you're excited to be doing. It's kind of fun It basically is that moment that you've always been waiting for where you're like all I'm gonna do is I'm gonna go to school And I'm gonna learn about the stuff I want to learn about and you've kind of slimmed everything down to that that really condensed material that you're in love with and it's It's a total blast, but it is so much work.",
    quote: "It is more work than you ever thought you would have to do. And it is Exclusively stuff that you're excited to be doing... It's a total blast, but it is so much work.",
    initial_code: "Describes medical school as incredibly demanding but fulfilling, focusing on the joy of learning highly condensed, exciting material.",
    theme: "Job Realities",
    subtheme: "Demanding but Rewarding"
  },
  {
    podcast_number: 3,
    podcast_title: "Gavin Clark: Master of Biophysics & MD Student Career Story",
    podcast_link: "https://soundcloud.com/what-to-be/gavin-clark-master-of-biophysics-md-student-at-georgetown-university",
    interviewee_name: "Gavin Clark",
    industry_sectors: ["Health Services", "Sciences", "Medical Technology"],
    transcript_excerpt_number: 2,
    transcript_excerpt_text: "That's like the billion dollar question. I love that. Okay. So also, a little bit here, anyone that is ever thinking about medicine, these are the questions you should start asking yourself about now. Way better do it now than when you're in your like 20s or something and then you're like, oh no, where does my passion come from? I don't know! If you figure out exactly what you want to do, you're in good shape. But yeah, my desire for medicine kind of, hate it because it sounds super, super trope y, you know? Like, I feel like a lot of people could agree with this. But, I've always loved science. Actually, Jacob and I went to high school together. And I, you know, he, he, he knows that I was always kind of like, excited when it came to the chemistry courses and the biology courses.",
    quote: "My desire for medicine... I've always loved science... I was always kind of like, excited when it came to the chemistry courses and the biology courses.",
    initial_code: "Explains a lifelong passion for science and a gradual, rather than sudden, gravitation towards medicine.",
    theme: "Choosing a Path",
    subtheme: "Passion & Early Interest"
  },
  {
    podcast_number: 3,
    podcast_title: "Gavin Clark: Master of Biophysics & MD Student Career Story",
    podcast_link: "https://soundcloud.com/what-to-be/gavin-clark-master-of-biophysics-md-student-at-georgetown-university",
    interviewee_name: "Gavin Clark",
    industry_sectors: ["Health Services", "Sciences", "Medical Technology"],
    transcript_excerpt_number: 3,
    transcript_excerpt_text: "So, I think the easiest thing to do is to finish your degree, go home with the information that you have, and immediately start making money somewhere, whether that's in your degree or not. You're like, I've done all this time learning, I want to start doing, and I want to start earning, and I want to start having a life, right? We're all really eager to like, make money. Grow up and go do stuff. Bartending was amazing, but I realized that because it was so different than what I had been learning and the kind of field that I had set myself up into, I was like, whoa, I'm actually not itching or scratching that itch that I've had.",
    quote: "Bartending was amazing, but I realized that because it was so different than what I had been learning... I'm actually not itching or scratching that itch that I've had.",
    initial_code: "Reflects on the value of taking a gap year to gain real-world experience (bartending), which helped clarify his true passion for science and intellectual work.",
    theme: "Career Pivots",
    subtheme: "Real-World Experience"
  },
  {
    podcast_number: 3,
    podcast_title: "Gavin Clark: Master of Biophysics & MD Student Career Story",
    podcast_link: "https://soundcloud.com/what-to-be/gavin-clark-master-of-biophysics-md-student-at-georgetown-university",
    interviewee_name: "Gavin Clark",
    industry_sectors: ["Health Services", "Sciences", "Medical Technology"],
    transcript_excerpt_number: 4,
    transcript_excerpt_text: "I think one of the biggest misconceptions About, like, all of this, I don't know, trying to get into medicine, trying to get into any of these fields, is that there is a single right way. And, like, that's like this, like, like, it's really pretty in your brain, you know, it's like super linear, it's like one straight path. You're like, oh, cool, just drive down this a while and I'll take a right turn and I'll be there. But it is so much more complicated than that. There is no perfect answer. There's no, like, algorithm. There's no, like, just, like, plug and chug and make it happen. You have to do the work. You have to, like, ask the questions and be open to changing. And then be open to being, like, You know what? This didn't work for me this time. I'm going to keep trying. I'm going to keep growing.",
    quote: "I think one of the biggest misconceptions... is that there is a single right way... But it is so much more complicated than that. There is no perfect answer. There's no, like, algorithm... You have to do the work. You have to, like, ask the questions and be open to changing.",
    initial_code: "Challenges the misconception of a single, linear path to success in medicine, emphasizing the need for adaptability, persistence, and learning from setbacks.",
    theme: "Misconceptions",
    subtheme: "Non-Linear Paths"
  },
  {
    podcast_number: 3,
    podcast_title: "Gavin Clark: Master of Biophysics & MD Student Career Story",
    podcast_link: "https://soundcloud.com/what-to-be/gavin-clark-master-of-biophysics-md-student-at-georgetown-university",
    interviewee_name: "Gavin Clark",
    industry_sectors: ["Health Services", "Sciences", "Medical Technology"],
    transcript_excerpt_number: 5,
    transcript_excerpt_text: "I would say do what I didn't do. Start asking questions. If you're interested in something, figure out a way to become a part of it in any way, shape or form, whether that's like volunteering or, you know, figuring out everything you can about the reality of what you're going to do. This is all about demystifying, like these crazy pathways and like all these crazy cool careers. But every single pathway has a day to day. And every pathway and every job has a, like, what you do. You wake up, you do the thing, you go home. Figure out what that looks like, because we romanticize all of this cool stuff.",
    quote: "I would say do what I didn't do. Start asking questions... figuring out everything you can about the reality of what you're going to do... Figure out what that looks like, because we romanticize all of this cool stuff.",
    initial_code: "Advises proactive exploration and questioning to understand the daily realities of a career, rather than romanticizing it, and seeking mentors and advisors.",
    theme: "Career Advice",
    subtheme: "Realistic Expectations"
  },
  {
    podcast_number: 4,
    podcast_title: "Aki Williams: Chief Operations Officer & Flight Nurse Career Story",
    podcast_link: "https://soundcloud.com/what-to-be/chief-operations-officer-defib-thisflight-nurse-aki-williams",
    interviewee_name: "Aki Williams",
    industry_sectors: ["Health Services", "Sciences", "Medical Technology", "Finance and Business", "Education", "Child Development", "Family Services"],
    transcript_excerpt_number: 1,
    transcript_excerpt_text: "Chief Operations Officer manages the overall picture day to day operations of an organization, making sure that staff has what they need nothing's in their way to be able to provide their best work for the day. It's also making sure that the client relations and the client experience student experience at defib is the best it can possibly be. And making sure that both of those sides the client facing and the employee facing are all working in a way that's going to keep the organization moving in a forward direction.",
    quote: "Chief Operations Officer manages the overall picture day to day operations of an organization, making sure that staff has what they need... and making sure that both of those sides the client facing and the employee facing are all working in a way that's going to keep the organization moving in a forward direction.",
    initial_code: "Defines the role of a Chief Operations Officer as managing day-to-day operations, ensuring employee and client satisfaction, and driving organizational progress.",
    theme: "Leadership",
    subtheme: "Operational Management"
  },
  {
    podcast_number: 4,
    podcast_title: "Aki Williams: Chief Operations Officer & Flight Nurse Career Story",
    podcast_link: "https://soundcloud.com/what-to-be/chief-operations-officer-defib-thisflight-nurse-aki-williams",
    interviewee_name: "Aki Williams",
    industry_sectors: ["Health Services", "Sciences", "Medical Technology", "Finance and Business", "Education", "Child Development", "Family Services"],
    transcript_excerpt_number: 2,
    transcript_excerpt_text: "I'd say tenacity is really important. There's a lot of people who will tell you, you can't or you need to wait, or what's your hurry. And as a kid, I think that was probably the most frustrating thing I would hear I was I really felt I was on this fast track towards a career. I knew what I wanted to do. And many times a lot of my friends parents would say, Well, what's your hurry? Why don't you just be a kid right now? Why are you so focused on getting a career and when you know what you want to do for the rest of your life? You want the rest of your life to start right away?",
    quote: "I'd say tenacity is really important. There's a lot of people who will tell you, you can't or you need to wait, or what's your hurry... when you know what you want to do for the rest of your life? You want the rest of your life to start right away?",
    initial_code: "Emphasizes the importance of tenacity and not letting others deter you when you have a clear career goal and a desire to start early.",
    theme: "Career Advice",
    subtheme: "Tenacity & Drive"
  },
  {
    podcast_number: 4,
    podcast_title: "Aki Williams: Chief Operations Officer & Flight Nurse Career Story",
    podcast_link: "https://soundcloud.com/what-to-be/chief-operations-officer-defib-thisflight-nurse-aki-williams",
    interviewee_name: "Aki Williams",
    industry_sectors: ["Health Services", "Sciences", "Medical Technology", "Finance and Business", "Education", "Child Development", "Family Services"],
    transcript_excerpt_number: 3,
    transcript_excerpt_text: "The other thing I would say is that, in addition to the tenacity, you have to have that internal humility, where you're really ready to have your butt handed to you sometimes and really go into that uncomfortable place, we're always afraid of failing. And that's why practice is so important practice where you're doing that thing that you just can't nail it, whether it's trying to take a blood pressure, or trying to start IVs, or whatever it might be, to be willing to say, I am not good at this, and I want to be better. And really leave yourself open to have that kind of not necessarily criticism, or if it is constructive criticism, if you will, where people tell you if you want to get better at this, you need to do A, B and C nobody really learns anything from great job.",
    quote: "you have to have that internal humility, where you're really ready to have your butt handed to you sometimes and really go into that uncomfortable place, we're always afraid of failing. And that's why practice is so important...",
    initial_code: "Advocates for internal humility and embracing uncomfortable learning experiences, stressing that constructive criticism and practice are essential for growth.",
    theme: "Skill Development",
    subtheme: "Embracing Challenges"
  },
  {
    podcast_number: 4,
    podcast_title: "Aki Williams: Chief Operations Officer & Flight Nurse Career Story",
    podcast_link: "https://soundcloud.com/what-to-be/chief-operations-officer-defib-thisflight-nurse-aki-williams",
    interviewee_name: "Aki Williams",
    industry_sectors: ["Health Services", "Sciences", "Medical Technology", "Finance and Business", "Education", "Child Development", "Family Services"],
    transcript_excerpt_number: 4,
    transcript_excerpt_text: "I do, I do a lot of resuscitation is are super memorable for me. But the very first resuscitation, I just remember this person saying that they didn't feel good. And then watching their face go blank. And I was by myself. And so I was in the hospital area. And I put on the emergency light and started doing CPR on this person and we actually did resuscitate them. And for the rest of the day, I don't know if my feet touched the ground. It was the most amazing adrenaline rush I've ever had. And I talked really loud, like I had just come out of a rock concert. When I left. Super everything I did was super hyper animated and loud. But at that moment, when I was doing the CPR, everything slowed down. It was kind of like being in the matrix where, you know, you just look around, you're like this is exactly what I'm supposed to be doing right now. I was born to do this. There's certain moments in life where you have like, everything falls together and you think there's a reason I'm here. I'm absolutely supposed to be doing this. This is my thing.",
    quote: "But at that moment, when I was doing the CPR, everything slowed down... I was born to do this. There's certain moments in life where you have like, everything falls together and you think there's a reason I'm here. I'm absolutely supposed to be doing this. This is my thing.",
    initial_code: "Recounts a memorable first resuscitation, describing an intense, focused experience that affirmed her calling in emergency medical services.",
    theme: "Career Fulfillment",
    subtheme: "Defining Moments"
  },
  {
    podcast_number: 4,
    podcast_title: "Aki Williams: Chief Operations Officer & Flight Nurse Career Story",
    podcast_link: "https://soundcloud.com/what-to-be/chief-operations-officer-defib-thisflight-nurse-aki-williams",
    interviewee_name: "Aki Williams",
    industry_sectors: ["Health Services", "Sciences", "Medical Technology", "Finance and Business", "Education", "Child Development", "Family Services"],
    transcript_excerpt_number: 5,
    transcript_excerpt_text: "There's a couple of things. One of those things is compassion, burnout. I see it with a lot of my colleagues and I know I had suffered from it before where you have people that are constantly needing and there's a lot of psych social stuff that gets intertwined and chemical dependency and people who don't have the resources they need, so they have to kind of maneuver and when you're in the emergency department, you're really the receptacle for all of the woes of our community, whether it be drug abuse, or mental illness, or people that just aren't getting what they need. And so they're they hit the door angry, and you just feel that all the time. And to be able to step back and know it's not about you and it's not personal, they're just working through what they need to work through is something that kind of will keep you going.",
    quote: "One of those things is compassion, burnout... when you're in the emergency department, you're really the receptacle for all of the woes of our community... And to be able to step back and know it's not about you and it's not personal, they're just working through what they need to work through is something that kind of will keep you going.",
    initial_code: "Discusses the challenge of compassion burnout in healthcare, dealing with patient anger and complex social issues, and the need to depersonalize these interactions.",
    theme: "Job Realities",
    subtheme: "Compassion Fatigue"
  },
  {
    podcast_number: 5,
    podcast_title: "Brook Ewoldsen: Fashion Institute Of Design (FIDM) Career Story",
    podcast_link: "https://soundcloud.com/what-to-be/fashion-institute-of-design-fidm-guest-speaker-brook-ewoldsen?utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing",
    interviewee_name: "Brook Ewoldsen",
    industry_sectors: ["Fashion and Interior Design"],
    transcript_excerpt_number: 1,
    transcript_excerpt_text: "I did grow up in Santa Cruz County. I went to Harbor High. I also attended Cabrillo when I was in high school, I was an art student and I loved like making off my own clothes. I loved painting murals. I would rearrange my mom's house which you know, everyday she came home she was like, Where is the couch? So I graduated but really didn't know what to do. I shared with my parents, I thought maybe I wanted to be an artist. And as you know, they're like starving artists. Not going to happen. So um, they couldn't relate. My dad had a PhD as a scientist, my mom's a teacher. So you know, they encouraged me to just get my general education.",
    quote: "I was an art student and I loved like making off my own clothes. I loved painting murals. I would rearrange my mom's house... I graduated but really didn't know what to do.",
    initial_code: "Recounts early artistic inclinations and parental guidance towards general education, highlighting the initial uncertainty about career direction.",
    theme: "Choosing a Path",
    subtheme: "Early Interests & Parental Influence"
  },
  {
    podcast_number: 5,
    podcast_title: "Brook Ewoldsen: Fashion Institute Of Design (FIDM) Career Story",
    podcast_link: "https://soundcloud.com/what-to-be/fashion-institute-of-design-fidm-guest-speaker-brook-ewoldsen?utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing",
    interviewee_name: "Brook Ewoldsen",
    industry_sectors: ["Fashion and Interior Design"],
    transcript_excerpt_number: 2,
    transcript_excerpt_text: "I was sitting in my office looking out the window, and I saw this guy raking. And I was watching him rake, and I'm like, Oh, my God, that just looks wonderful. Like, I want to be out there raking leaves with him, like, you know, kind of cleaning it up. And you know, I'm kind of looking at them planting the plants. And I'm at that time, I just had this epiphany, like this realization, it's like, oh, my gosh, you are in the wrong line of business girlfriend, like, this is not what you want to do, you do not want to sit at a desk, you don't want to work in a computer, you want to be out there, and you want to like make things more beautiful.",
    quote: "I was sitting in my office looking out the window, and I saw this guy raking... I just had this epiphany... you are in the wrong line of business... you want to be out there, and you want to like make things more beautiful.",
    initial_code: "Describes a pivotal moment of self-realization that her desk job was unfulfilling, leading to a desire for a more active, creative, and aesthetically focused career.",
    theme: "Career Pivots",
    subtheme: "Self-Discovery"
  },
  {
    podcast_number: 5,
    podcast_title: "Brook Ewoldsen: Fashion Institute Of Design (FIDM) Career Story",
    podcast_link: "https://soundcloud.com/what-to-be/fashion-institute-of-design-fidm-guest-speaker-brook-ewoldsen?utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing",
    interviewee_name: "Brook Ewoldsen",
    industry_sectors: ["Fashion and Interior Design"],
    transcript_excerpt_number: 3,
    transcript_excerpt_text: "It it's always well, it's always challenging to keep the audience in this case, teenagers inspired and connected. Technology has certainly come, you know, competes for attention. So that's something that's very challenging, building awareness. So it's not only teenagers that may not know about this industry, but educators, administrators, the general public, and I think it's it, unfortunately, the art and design of the things that we own and value haven't really been given the value, the people that create them here haven't been given the value that perhaps they need to be recognized for. If you go to Europe, a fashion designer is the equivalent to like a lawyer or a doctor, they're very highly esteemed, they're artists. And here, you know, the United States we, I think just take them for granted, you know, like it just happens or something. So So that's challenging.",
    quote: "It's always challenging to keep the audience... inspired and connected. Technology... competes for attention... the art and design... haven't really been given the value... If you go to Europe, a fashion designer is the equivalent to like a lawyer or a doctor, they're very highly esteemed...",
    initial_code: "Highlights the challenges of inspiring teenagers and raising awareness about the value of art and design careers, noting the disparity in recognition compared to other professions.",
    theme: "Job Realities",
    subtheme: "Industry Recognition"
  },
  {
    podcast_number: 5,
    podcast_title: "Brook Ewoldsen: Fashion Institute Of Design (FIDM) Career Story",
    podcast_link: "https://soundcloud.com/what-to-be/fashion-institute-of-design-fidm-guest-speaker-brook-ewoldsen?utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing",
    interviewee_name: "Brook Ewoldsen",
    industry_sectors: ["Fashion and Interior Design"],
    transcript_excerpt_number: 4,
    transcript_excerpt_text: "I would say, if your looking for a career do what you love and as confucius once said do what you love and youll never have to work a day in your life. So that is absolutely the best advice I could ever give anybody and dont doubt yourself because that thing that you dream of can be your destination you just have to keep going, keep working towards it.",
    quote: "I would say, if your looking for a career do what you love and as confucius once said do what you love and youll never have to work a day in your life. So that is absolutely the best advice I could ever give anybody and dont doubt yourself because that thing that you dream of can be your destination you just have to keep going, keep working towards it.",
    initial_code: "Advises pursuing a career based on passion, quoting Confucius, and encourages self-belief and persistent effort towards one's dreams.",
    theme: "Career Advice",
    subtheme: "Following Passion"
  },
  {
    podcast_number: 6,
    podcast_title: "Sukh Singh: CEO of Code Naturally Career Story",
    podcast_link: "https://soundcloud.com/what-to-be/interview-with-ceo-of-code-naturally-sukh-singh",
    interviewee_name: "Sukh Singh",
    industry_sectors: ["Information and Computer Technologies"],
    transcript_excerpt_number: 1,
    transcript_excerpt_text: "So Code Naturally is a Santa Cruz-based startup. We've been here for over three years. We have developed a curriculum and an application, pretty much hand-in-hand, with students and schools for the last three years. And we've applied what's called the Lean Methodology to developing the app and curriculum. Essentially, it just means that you do a lot of testing, that you build a minimum viable product which is just something that works, that does the core value that you're trying to present to your customer. And you take that to them, you put it in their hands, and you see how they react to it. And you listen to them, and then you kind of go back to the drawing board, you figure out what you can adjust to make it better, and then you release a new iteration as quickly as possible.",
    quote: "We've applied what's called the Lean Methodology to developing the app and curriculum. Essentially, it just means that you do a lot of testing, that you build a minimum viable product... and you listen to them, and then you kind of go back to the drawing board... and then you release a new iteration as quickly as possible.",
    initial_code: "Explains Code Naturally's iterative development process using Lean Methodology, emphasizing continuous testing, customer feedback, and rapid iteration to improve their product.",
    theme: "Innovation",
    subtheme: "Lean Development"
  },
  {
    podcast_number: 6,
    podcast_title: "Sukh Singh: CEO of Code Naturally Career Story",
    podcast_link: "https://soundcloud.com/what-to-be/interview-with-ceo-of-code-naturally-sukh-singh",
    interviewee_name: "Sukh Singh",
    industry_sectors: ["Information and Computer Technologies"],
    transcript_excerpt_number: 2,
    transcript_excerpt_text: "And so originally when we started, we thought that our app and our curriculum would fit really well into a math classroom because a lot of the concepts that students are applying fit directly along with common core math for third to eighth grade. But what we found when we started approaching math teachers is that often they were too busy. They had a lot on their plates already and they couldn't really make time for coding. But there were a lot of social science teachers that were really interested in this idea of empathy, this idea of growth mindset, this idea of being like an empathetic learner, and so they took on the challenge of learning to code themselves and they kind of learned to code with their students. And we've actually found that to be kind of the best way forward because then students see their teachers fail, the teachers developing a portfolio along with their students, everyone's at the table. Students are getting to teach their teachers, everyone's kind of getting to go at their own pace and that's okay.",
    quote: "We found when we started approaching math teachers is that often they were too busy... But there were a lot of social science teachers that were really interested in this idea of empathy, this idea of growth mindset... And we've actually found that to be kind of the best way forward because then students see their teachers fail...",
    initial_code: "Describes an unexpected shift in target audience, finding success with social science teachers who embraced learning alongside students, fostering empathy and a growth mindset in coding education.",
    theme: "Education",
    subtheme: "Teaching Approach"
  },
  {
    podcast_number: 6,
    podcast_title: "Sukh Singh: CEO of Code Naturally Career Story",
    podcast_link: "https://soundcloud.com/what-to-be/interview-with-ceo-of-code-naturally-sukh-singh",
    interviewee_name: "Sukh Singh",
    industry_sectors: ["Information and Computer Technologies"],
    transcript_excerpt_number: 3,
    transcript_excerpt_text: "So the original idea was like way stupider than what we have now. It was a Windows Surface application and the idea was– the reason that it's called Code Naturally is that we get to make an app where students can handwrite code, and the app would convert the code to text and then run it. So that way, the idea is that, like, there's a ton of research that shows that writing by hand helps with your memory, you learn way faster, you retain more muscle memory, you slow down, right? That's the main thing that's providing, that you slow down. And so we thought that if students could [handwrite it out]. Exactly, yeah, it was a really dumb hypothesis, right? But like, we spoke to researchers around the world, and they did agree, they were like, “handwriting could help”. And so we thought that'd be the perfect thing for first-graders to third-graders. We were thinking way younger age range, kids that aren't typing yet, you know?",
    quote: "The original idea was like way stupider than what we have now... we get to make an app where students can handwrite code, and the app would convert the code to text and then run it... we spoke to researchers around the world, and they did agree, they were like, “handwriting could help”.",
    initial_code: "Recounts the initial, less practical idea for Code Naturally involving handwriting code, highlighting the evolution of the concept based on research and practical feedback.",
    theme: "Innovation",
    subtheme: "Idea Evolution"
  },
  {
    podcast_number: 6,
    podcast_title: "Sukh Singh: CEO of Code Naturally Career Story",
    podcast_link: "https://soundcloud.com/what-to-be/interview-with-ceo-of-code-naturally-sukh-singh",
    interviewee_name: "Sukh Singh",
    industry_sectors: ["Information and Computer Technologies"],
    transcript_excerpt_number: 4,
    transcript_excerpt_text: "Well, if there has to be a job that that feature does, there has to be something specific that's going to enable for the students. And so if the feature isn't started with that the feature hasn't thought about how are students going to use it? And what is this going to enable them to do? And why is that important? If you can see those three things, we definitely don't need it. And so like, before I get excited about anything, I have to kind of put myself through that test, where it's like, you know, this might sound great, but how is this gonna work? And how is it going to work within the rest of the features that we have? Even like, you know, you can totally make an app just have way too many features. And I can just make it a horrible experience. Right? Yeah. And so sometimes even thinking about, like, if I want to add a feature, what feature Am I willing to let go? Yeah, you know, and so really constraining yourself creatively to really focus it on like, well, what the what's the goal here? For them? It's for them to express themselves creatively. Is this feeding into that main goal? Oh, it's not well, then, you know.",
    quote: "If there has to be a job that that feature does, there has to be something specific that's going to enable for the students... if you can see those three things, we definitely don't need it... really constraining yourself creatively to really focus it on like, well, what the what's the goal here?",
    initial_code: "Explains a rigorous approach to feature development, emphasizing that new features must directly enable student creativity and align with the core goal, rather than just being 'cool'.",
    theme: "Product Development",
    subtheme: "Feature Prioritization"
  },
  {
    podcast_number: 6,
    podcast_title: "Sukh Singh: CEO of Code Naturally Career Story",
    podcast_link: "https://soundcloud.com/what-to-be/interview-with-ceo-of-code-naturally-sukh-singh",
    interviewee_name: "Sukh Singh",
    industry_sectors: ["Information and Computer Technologies"],
    transcript_excerpt_number: 5,
    transcript_excerpt_text: "So we're a bootstrap startup. And so that means that we support ourselves through actually generating revenue for the last three years. And as someone that's just kind of like starting up a company, that's very difficult. That's been something that's been a consistent hurdle for us. And like, the only way that we got through our first year was thanks to, you know, thanks to family. And thanks to Airbnb, because we just got really good at doing sheets and Airbnb in our master bedroom. And that totally paid our rent for the entire first year that we did our business. But after that, it was really like, you know, figuring out how can we deliver value right away? Who can we deliver that value to? And how much is a fair price to charge for that.",
    quote: "So we're a bootstrap startup... that's very difficult. That's been something that's been a consistent hurdle for us... figuring out how can we deliver value right away? Who can we deliver that value to? And how much is a fair price to charge for that.",
    initial_code: "Describes the financial challenges of bootstrapping a startup, highlighting the need for creative revenue generation and immediate value delivery to sustain the business.",
    theme: "Entrepreneurship",
    subtheme: "Bootstrapping Challenges"
  }
];

// Main App Component
const App = () => {
  const [quotesData, setQuotesData] = useState(careerQuotesData); // Use the provided dataset directly
  const [isLoading, setIsLoading] = useState(false); // No longer loading from CSV
  const [error, setError] = useState(null); // No longer loading from CSV

  const [selectedThemes, setSelectedThemes] = useState([]);
  const [selectedSubthemes, setSelectedSubthemes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  // Firebase states
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [favoritedQuotes, setFavoritedQuotes] = useState([]);

  // Initialize Firebase and set up auth listener
  useEffect(() => {
    try {
      const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
      const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};

      const app = initializeApp(firebaseConfig);
      const firestoreDb = getFirestore(app);
      const firebaseAuth = getAuth(app);

      setDb(firestoreDb);
      setAuth(firebaseAuth);

      const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
        if (user) {
          setUserId(user.uid);
        } else {
          try {
            if (typeof __initial_auth_token !== 'undefined') {
              await signInWithCustomToken(firebaseAuth, __initial_auth_token);
            } else {
              await signInAnonymously(firebaseAuth);
            }
          } catch (error) {
            console.error("Firebase authentication error:", error);
          }
        }
        setIsAuthReady(true);
      });

      return () => unsubscribe();
    } catch (error) {
      console.error("Failed to initialize Firebase:", error);
    }
  }, []);

  // Listen for favorited quotes from Firestore
  useEffect(() => {
    if (db && userId && isAuthReady) {
      const favoritedQuotesCollectionRef = collection(db, `artifacts/${__app_id}/users/${userId}/favoritedQuotes`);
      const unsubscribe = onSnapshot(favoritedQuotesCollectionRef, (snapshot) => {
        const favorites = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setFavoritedQuotes(favorites);
      }, (error) => {
        console.error("Error fetching favorited quotes:", error);
      });
      return () => unsubscribe();
    }
  }, [db, userId, isAuthReady]);

  // Extract unique themes from the loaded quotesData
  const themes = useMemo(() => {
    return [...new Set(quotesData.map(q => q.theme))].sort();
  }, [quotesData]);

  // Extract subthemes relevant to the currently selected themes
  const subthemesForSelectedThemes = useMemo(() => {
    if (selectedThemes.length === 0) {
      return [...new Set(quotesData.map(q => q.subtheme))].sort();
    }
    const uniqueSubthemes = [...new Set(
      quotesData
        .filter(q => selectedThemes.includes(q.theme))
        .map(q => q.subtheme)
    )].sort();
    return uniqueSubthemes;
  }, [selectedThemes, quotesData]);

  // Filter quotes based on selections and search query
  const filteredQuotes = useMemo(() => {
    const lowerCaseSearchQuery = searchQuery.toLowerCase();

    let quotesToFilter = showFavoritesOnly ? favoritedQuotes : quotesData;

    return quotesToFilter.filter(q => {
      const matchesTheme = selectedThemes.length === 0 || selectedThemes.includes(q.theme);
      const matchesSubtheme = selectedSubthemes.length === 0 || selectedSubthemes.includes(q.subtheme);

      const matchesSearch = lowerCaseSearchQuery === '' ||
        (q.quote && q.quote.toLowerCase().includes(lowerCaseSearchQuery)) ||
        (q.interviewee_name && q.interviewee_name.toLowerCase().includes(lowerCaseSearchQuery)) ||
        (q.initial_code && q.initial_code.toLowerCase().includes(lowerCaseSearchQuery)) ||
        (q.industry_sectors && q.industry_sectors.some(sector => sector.toLowerCase().includes(lowerCaseSearchQuery)));

      return matchesTheme && matchesSubtheme && matchesSearch;
    });
  }, [selectedThemes, selectedSubthemes, searchQuery, showFavoritesOnly, quotesData, favoritedQuotes]);

  // Handle theme selection (toggle add/remove)
  const handleThemeSelect = (theme) => {
    setSelectedThemes(prevSelectedThemes => {
      if (prevSelectedThemes.includes(theme)) {
        return prevSelectedThemes.filter(t => t !== theme);
      } else {
        return [...prevSelectedThemes, theme];
      }
    });
    setSelectedSubthemes(prevSelectedSubthemes =>
      prevSelectedSubthemes.filter(subtheme =>
        quotesData.some(q => (selectedThemes.includes(q.theme) || theme === q.theme) && q.subtheme === subtheme)
      )
    );
    setSearchQuery('');
  };

  // Handle subtheme selection (toggle add/remove)
  const handleSubthemeSelect = (subtheme) => {
    setSelectedSubthemes(prevSelectedSubthemes => {
      if (prevSelectedSubthemes.includes(subtheme)) {
        return prevSelectedSubthemes.filter(s => s !== subtheme);
      } else {
        return [...prevSelectedSubthemes, subtheme];
      }
    });
    setSearchQuery('');
  };

  // Handle search input change
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  // Handle favorite toggle
  const handleFavoriteToggle = async (quoteData) => {
    if (!db || !userId) {
      console.error("Firestore not initialized or user not authenticated.");
      return;
    }

    const quoteIdentifier = `${quoteData.podcast_number}-${quoteData.transcript_excerpt_number}`;

    const existingFavorite = favoritedQuotes.find(
      (fav) => `${fav.podcast_number}-${fav.transcript_excerpt_number}` === quoteIdentifier
    );

    const favoritedQuotesCollectionRef = collection(db, `artifacts/${__app_id}/users/${userId}/favoritedQuotes`);

    try {
      if (existingFavorite) {
        await deleteDoc(doc(favoritedQuotesCollectionRef, existingFavorite.id));
        console.log("Quote unfavorited successfully!");
      } else {
        await addDoc(favoritedQuotesCollectionRef, quoteData);
        console.log("Quote favorited successfully!");
      }
    } catch (error) {
      console.error("Error toggling favorite status:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 p-4 font-sans antialiased text-gray-800 flex items-center justify-center">
        <div className="text-center text-xl text-gray-600">Loading quotes data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-4 font-sans antialiased text-gray-800 flex items-center justify-center">
        <div className="text-center text-xl text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 font-sans antialiased text-gray-800">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6 md:p-8">
        <h1 className="text-3xl md:text-4xl font-extrabold text-center text-indigo-700 mb-8">
          Interactive Career Quote Gallery
        </h1>

        {/* User ID Display */}
        {isAuthReady && userId && (
          <div className="text-center text-sm text-gray-500 mb-4">
            User ID: <span className="font-mono text-gray-700 break-all">{userId}</span>
          </div>
        )}
        {!isAuthReady && (
          <div className="text-center text-gray-500 mb-4">
            Loading authentication...
          </div>
        )}

        {/* Search Bar */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="Search by keyword, person, or industry..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full px-5 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-lg"
          />
        </div>

        {/* Show Favorites Only Toggle */}
        <div className="mb-8 flex items-center justify-center">
          <label htmlFor="favorites-toggle" className="flex items-center cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                id="favorites-toggle"
                className="sr-only"
                checked={showFavoritesOnly}
                onChange={() => setShowFavoritesOnly(!showFavoritesOnly)}
              />
              <div className="block bg-gray-300 w-14 h-8 rounded-full"></div>
              <div
                className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform
                  ${showFavoritesOnly ? 'translate-x-full bg-pink-500' : ''}`}
              ></div>
            </div>
            <div className="ml-3 text-gray-700 font-medium">
              Show Favorites Only ({favoritedQuotes.length})
            </div>
          </label>
        </div>


        {/* Theme Selection */}
        <div className="mb-8">
          <h2 className="text-xl md:text-2xl font-semibold text-gray-700 mb-4">Explore Major Themes:</h2>
          <div className="flex flex-wrap gap-3">
            {themes.map(theme => (
              <button
                key={theme}
                onClick={() => handleThemeSelect(theme)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ease-in-out
                  ${selectedThemes.includes(theme)
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-gray-200 text-gray-700 hover:bg-indigo-100 hover:text-indigo-700'
                  }`}
              >
                {theme}
              </button>
            ))}
          </div>
        </div>

        {/* Subtheme Selection (conditionally rendered) */}
        {subthemesForSelectedThemes.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl md:text-2xl font-semibold text-gray-700 mb-4">
              Subthemes:
            </h2>
            <div className="flex flex-wrap gap-3">
              {subthemesForSelectedThemes.map(subtheme => (
                <button
                  key={subtheme}
                  onClick={() => handleSubthemeSelect(subtheme)}
                  className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ease-in-out
                    ${selectedSubthemes.includes(subtheme)
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-gray-200 text-gray-700 hover:bg-purple-100 hover:text-purple-700'
                    }`}
                >
                  {subtheme}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Display Filtered Quotes */}
        <div className="mt-10">
          <h2 className="text-xl md:text-2xl font-semibold text-gray-700 mb-6">
            {selectedThemes.length > 0 || selectedSubthemes.length > 0 || searchQuery || showFavoritesOnly ? "Filtered Quotes:" : "All Quotes:"}
          </h2>
          {filteredQuotes.length === 0 ? (
            <p className="text-center text-gray-500 text-lg">No quotes found for the selected criteria.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredQuotes.map((quoteData, index) => (
                <QuoteCard
                  key={`${quoteData.podcast_number}-${quoteData.transcript_excerpt_number}`} // Unique key for quotes
                  quoteData={quoteData}
                  onFavoriteToggle={handleFavoriteToggle}
                  isFavorited={favoritedQuotes.some(
                    (fav) => fav.podcast_number === quoteData.podcast_number &&
                             fav.transcript_excerpt_number === quoteData.transcript_excerpt_number
                  )}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Quote Card Component
const QuoteCard = ({ quoteData, onFavoriteToggle, isFavorited }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-200 ease-in-out flex flex-col justify-between relative">
      <button
        onClick={() => onFavoriteToggle(quoteData)}
        className={`absolute top-4 right-4 p-2 rounded-full transition-colors duration-200
          ${isFavorited ? 'text-pink-500 hover:text-pink-600 bg-pink-100' : 'text-gray-400 hover:text-pink-500 hover:bg-gray-100'}`}
        title={isFavorited ? "Remove from favorites" : "Add to favorites"}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          viewBox="0 0 24 24"
          fill={isFavorited ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
        </svg>
      </button>

      <div>
        <blockquote className="text-lg italic text-gray-700 leading-relaxed mb-4 pr-10">
          "{quoteData.quote}"
        </blockquote>
        <p className="text-right text-sm font-semibold text-indigo-500 mb-3">
          — {quoteData.interviewee_name}
        </p>
        <p className="text-sm text-gray-600 mb-2">
          <strong className="font-medium">Takeaway:</strong> {quoteData.initial_code}
        </p>
      </div>
      <div className="flex flex-wrap gap-2 mt-4 text-xs">
        {quoteData.industry_sectors && quoteData.industry_sectors.map(sector => (
          <span key={sector} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
            {sector}
          </span>
        ))}
        {quoteData.theme && (
          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full">
            Theme: {quoteData.theme}
          </span>
        )}
        {quoteData.subtheme && (
          <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full">
            Subtheme: {quoteData.subtheme}
          </span>
        )}
      </div>
      {quoteData.podcast_link && (
        <a
          href={quoteData.podcast_link}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center text-indigo-600 hover:text-indigo-800 text-sm font-medium transition-colors duration-200"
        >
          Listen to Podcast
          <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
          </svg>
        </a>
      )}
    </div>
  );
};

export default App;