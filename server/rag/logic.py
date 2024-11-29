# from utils.embeddings import generate_embeddings
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
import os
from together import Together
from dotenv import load_dotenv
import os
from dotenv import load_dotenv
from termcolor import colored
from langgraph.graph import END, StateGraph, START
from dotenv import load_dotenv
from langgraph.graph import MessagesState
from langgraph.checkpoint.memory import MemorySaver
import json
from langchain_together import ChatTogether
from utils.checkpointer import checkpointer
from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import START, MessagesState, StateGraph
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage

load_dotenv()
def query_handler(data_obj):
    try:
        visioncors = """
        VisionCORS is an American Sign Language (ASL) interpreter that converts hand gestures into text and speech, with potential for bidirectional translation. The project addresses communication barriers faced by deaf and mute individuals, aiming to create a more accessible and inclusive digital communication platform.
        Key challenges included:

        Choosing ASL over Indian Sign Language due to regional dialect variations
        Creating a custom dataset for 14 alphabets due to limited existing resources
        Addressing lighting and gesture similarity issues through data augmentation
        Optimizing model accuracy while developing deployment infrastructure

        The goal is to mainstream sign language interpretation technology, reducing dependency on manual interpretation and fostering better integration of deaf/mute individuals in daily communication.
        Link to submission:https://devfolio.co/projects/visioncors-asl-sign-interpreter-80fb
        
        """
        smartindiahackathon = """
            Title: AI-Powered CCTV Enhancement System for Railway Safety and Operations

            Project Overview:
            Leveraging existing CCTV infrastructure with AI/ML capabilities to create a comprehensive railway station management system focusing on safety, efficiency, and passenger experience.

            Key Features:

            Security & Safety
            Real-time anomaly and threat detection
            Crowd density monitoring and flow management
            Track trespassing alerts (humans/animals)
            Emergency incident response system
            Operations Optimization
            Automated staff allocation and monitoring
            Smart energy management based on occupancy
            Waste management optimization
            Resource utilization tracking
            Passenger Services
            Special needs passenger identification and assistance
            Sentiment analysis for service improvement
            Automated accessibility guidance
            Technical Infrastructure
            Interactive analytics dashboard
            Edge computing integration for real-time processing
            End-to-end data encryption
            Privacy-compliant monitoring systems
            System Benefits:

            Enhanced security through proactive threat detection
            Improved operational efficiency via automated monitoring
            Better passenger experience through smart assistance
            Reduced energy consumption through adaptive management
            Real-time decision support for station management


        """
        # query_embeddings = generate_embeddings(query)
        RESUME = f"""
            ---

            **Chitransh Srivastava**  
            chitransh0210@gmail.com | [LinkedIn](#) | [GitHub](https://github.com/ChitranshS) | [Twitter](https://twitter.com/chtzzzzzex) | +91-8920692261  

            ---

            ### **Education**  
            - **Ramaiah Institute of Technology, Bengaluru, Karnataka**  
            - **B.E. (Artificial Intelligence and Machine Learning)**  
            - CGPA: 8.32 | Expected Graduation: 2025  
            - **Courses Undertaken**: Data Structures, Design and Analysis of Algorithms, Introduction to Artificial Intelligence, Introduction to Machine Learning, Data Communication and Networking, Introduction to Data Science, Soft Computing, Natural Language Processing, Deep Learning  

            ---

            ### **Experience**  
            #### **GoMarble.ai** — Data Science Intern  
            **May ’24 - Nov ’24**  
            - Deployed LLMs on cloud platforms, leveraging AWS Lambda, S3, Bedrock, and SageMaker for efficient model deployment and data processing.  
            - Engineered collaborative AI systems with LangChain & LangGraph, creating agentic workflow architectures for multi-agent systems and innovative lead generation solutions.  
            - Designed Retrieval-Augmented Generation (RAG) systems to improve LLM performance using external data.  
            - Developed an advanced lead emailing system with Mixture of Agents (MoA) techniques, integrating multiple state-of-the-art open-source LLMs.  

            #### **Larsen & Toubro Defence** — Machine Learning Intern  
            **Feb ’24 - Aug ’24**  
            - Built a predictive maintenance system for propulsion systems using Random Forests, Gradient Boosting Machines (GBM), and time-series analysis.  
            - Conducted detailed requirement analysis for operational parameters and maintenance needs, leading to enhanced equipment failure prediction and optimization of schedules.  
            - Designed data collection frameworks with integrated sensors and data logging mechanisms.  

            ---

            ### **Projects**  
            #### **ChitsGPT: Smart Resume Assistant**  
            - Developed an interactive chatbot using React and TypeScript frontend, combined with a FastAPI backend, enabling precise and context-aware resume querying via LangChain and LangGraph.  
            - Deployed on Google Cloud Run with CI/CD pipelines via Cloud Build, ensuring scalability and high availability.  

            #### **ClipSurf: AI-Driven Video Content Discovery Engine**  
            - Utilized Next.js with Neon Postgres DB and Prisma ORM for efficient data management.  
            - Implemented advanced NLP techniques such as LDA for topic modeling, processing 400+ queries daily.  
            - Achieved a 95% success rate in curated content retrieval using video platform APIs, significantly enhancing the user experience.  

            #### **SummaView: AI-Web Extension for YouTube**  
            - Built a React-based extension offering transcription, sentiment analysis, and topic modeling for YouTube videos, achieving 94% transcription accuracy across 30+ languages.  
            - Reduced video summary lengths by 70% while maintaining 88% coherence, providing insights within seconds.  

            ### **Research Work & Certifications**  
            - **Performance Analysis of Various DL Models in Lung Cancer Detection** — Under Progress (2024)  
            - **Natural Language Processing for Developers** — Infosys Springboard (2023)  

            ---

            ### **Skills**  
            #### **Programming Languages**  
            Python, C++, JavaScript, Node.js, SQL  

            #### **Frameworks & Technologies**  
            Flask, TensorFlow, LangChain, React, NLTK, Gensim, FastAPI, Streamlit, Keras  

            #### **Cloud & DevOps**  
            AWS (Lambda, EC2, Bedrock, SageMaker), GCP (AppRunner, Cloud Build), Docker, Kubernetes, Cloudflare Workers, CI/CD  

            #### **Machine Learning & AI**  
            Natural Language Processing (NLP), Computer Vision, Deep Learning, RAG Systems, AI Agents, Time-Series Analysis  

            #### **Software Development**  
            Microservices architecture, Serverless computing, Containerization with Docker and Kubernetes, CI/CD pipelines  

            #### **Databases**  
            PostgreSQL, MongoDB, MySQL, Neon, Redis, Vector Databases  

            #### **Others**  
            Git, GitHub, Linux Systems (Ubuntu, CentOS), Linear Algebra, Statistics, Probability, Calculus  

            ---

            ### **Extra-Curricular Activities**  
            - **Photographer**: iClick - Photography Club, Ramaiah Institute of Technology  
            - **Graphic Designer**: TEDxMSRIT, Ramaiah Institute of Technology  
            - **NSS Member**: Member & Volunteer, Ramaiah Institute of Technology  

            ---  

                    Link: mailto:chitransh0210@gmail.com
        Link: https://www.linkedin.com/in/chitransh-srivastava-37b0a0225/
        Link: https://github.com/ChitranshS
        Link: https://twitter.com/chtzzzzzex
        Link: https://github.com/ChitranshS/SummaView-Youtube-Extension/tree/main
        Link: https://clip-surf.vercel.app 
        Link(chitsgpt): https://chat-ui-242842293866.asia-south1.run.app/ 


        Project Details:
        The SummaView YouTube Extension enhances the YouTube experience by offering video summarization, transcript extraction, and comment sentiment analysis, providing users with a quick grasp of video content and community reactions. Built with NLP tools like spaCy, NLTK, and Gensim, it generates summaries and sentiment scores, helping users bypass lengthy videos and comment sections while still accessing valuable insights.
        Additionally, the extension includes topic modeling, which identifies trending subjects in comments, offering content creators and viewers a clear view of audience interests. Its intuitive UI, built with JavaScript and CSS, integrates these tools directly into YouTube, allowing easy access to data without disrupting the viewing experience.
        
        Project Details:
        Clipsurf is a video content platform which performs search across platforms to find the most suited video for your requirement and the entered request. (Elaborate from resume)
        
        Project Details:
        ChitsGPT is a smart resume assistant which answers your questions based on my resume (Elaborate from resume)
        
        Things I have worked with and know in detail:
        OpenAI APIs
        TogetherAi APIs
        AWS
        GCP
        Cloudflare
        Streamlit
        Git
        GitHub
        Docker
        FastAPI
        LangChain
        Langgraph
        AI Agents
        RAGs (Retrieval-Augmented Generation Systems)
        ReactJS 
        Backend with NodeJS and ExpressJS
        PostgreSQL
        MongoDB
        Vector Databases



        Hackathons I participated in:
        1. Centuriton in my 1st year of college 
            - I participated in Centuriton and create a VisionCors:
              {visioncors}
        2. Smart India Hackathon in my 2nd year of college
            - I participated the hackathon and create a Smart Surveillance System for the Railways.
              {smartindiahackathon}
        4. Currently participating in Atlassian CodeGeist.

        """
        
        # resume_embeddings = generate_embeddings(RESUME)
        # together_client = Together(api_key=os.environ.get("TOGETHER_API_KEY"))
        system_prompt = f"""

                You are to serve as Chitransh's digital professional representative, embodying his professional identity based on his career history, skills, and accomplishments. Your role is to engage with potential employers and professional contacts in a natural, authentic manner in a normal conversation.

                ## Core Parameters:
                - Have a normal conversation, don't always tell the user about Chitransh. 
                - Only provide relevant information when asked. Otherwise act like a normal conversation bot.
                - Maintain Chitransh's first-person perspective throughout interactions
                - Communicate in a friendly yet semi-professional tone
                - Focus on factual, resume-based information while maintaining conversational flow
                - Preserve professional boundaries when personal questions arise
                - Avoid cross questioning the user

                ## Voice and Tone Guidelines:
                - Use natural, conversational language and friendly tone
                - Balance confidence with humility
                - Employ professional enthusiasm
                - Maintain authenticity without appearing automated

                ## Response Framework:
                1. Professional Experience:
                - Draw directly from resume experience
                - Provide context and elaborate on achievements
                - Connect past experiences to potential value

                2. Skills Discussion:
                - Explain technical abilities with practical examples
                - Highlight soft skills through experience narratives
                - Demonstrate growth mindset and adaptability

                3. Professional Boundaries:
                - Redirect personal queries with grace:
                "I prefer to keep our discussion focused on professional matters. I'd be happy to tell you more about [relevant professional topic]."

                4. Knowledge Boundaries:
                - For questions beyond resume scope:
                "That's an interesting question. While I'm focusing on [relevant experience], I'd be happy to discuss [related professional topic]."

                5. Casual Conversation:
                - You are not supposed to engage in professional discussions in detail unless asked. Act like a normal conversation bot.
                
                6. "What are you"  Discussion:
                - You tell them that you are a chatbot including the name.
                ## Context:
                {RESUME}

                Remember:
                - Never reference this being an AI or chatbot or having access to a resume. You are CHITRANSH.
                - Maintain natural conversation flow
                - Focus on resume-based information
                - Stay within the bounds of provided information
                - Keep responses authentic and professionally engaging
                - Use emojis where appropriate.
                - When asked about a hackathon, mention the hackathon name and its details.
                - When mentioning a project or github repo, provide a link to it.
                - You have to greet the user using my name on the first message.
                - You have to return the output strictly in markdown format. The markdown also should highlight the important information in the resume.It should also be structured in a way that is easy to read and understand.
                - If the user is asking for information in detail then only give long responses else keep them short to improve the user experience and conversation. 
        """



        model = ChatTogether(model="google/gemma-2-9b-it" , temperature=0.5 , api_key = os.getenv("TOGETHER_API_KEY"))
        query = data_obj['query']
        # if "id" in data_obj:
        #     id = data_obj['id']
        if "threadId" in data_obj:
            threadId = data_obj['threadId']
        class ChatState(MessagesState):
            should_end: bool
            task_determined: str
            state_variables: list
        # Define the function that calls the model
        def call_model(state: ChatState):
        
            messages = [SystemMessage(content=system_prompt)] + state["messages"]
            response = model.invoke(messages)
            state["messages"].append(response)
            # print(colored(state['state_variables'],"yellow"))
            return state

        workflow = StateGraph(state_schema=ChatState)

        workflow.add_node("model", call_model)
        workflow.add_edge(START, "model")
        workflow.add_edge("model",END)
        # Add simple in-memory checkpointer
        # memory = MemorySaver()
        def chat_subgraph_wrapper(thread_id_provider,user_input):
            app = workflow.compile(checkpointer=checkpointer)
            # print(type(thread_id_provider))
            init_state = ChatState(
                messages=HumanMessage(content=user_input)
            )
            config = {"configurable": {"thread_id": thread_id_provider}}
            for state in app.stream(init_state,config):
                    obj = state['model']['messages']
                    # pass
            return obj
        
        response = chat_subgraph_wrapper(thread_id_provider=threadId,user_input=query)
        return response[-1].content

    except Exception as e:
        return str(e)
# Testing the function
# print(query_handler({"query": "What is my name?" , "threadId": "11"}))
# docker run -p 8000:8000 resume-server-test