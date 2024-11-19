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
        # query_embeddings = generate_embeddings(query)
        RESUME = """
        Chitransh Srivastava
        chitransh0210@gmail.com | LinkedIn | Github | Twitter | +91-8920692261
        Education
        • Ramaiah Institute of Technology Bengaluru, Karnataka
        B.E. (Artificial Intelligence and Machine Learning) CGPA: 8.32 Expected Graduation: 2025
        • Courses Undertaken: Data Structures, Design and Analysis of Algorithms, Introduction to Artificial Intelligence,
        Introduction to Machine Learning, Data Communication and Networking, Introduction to Data Science, Soft Computing,
        Natural Language Processing, Deep Learning.
        Experience
        • GoMarble.ai — Data Science Intern (Bengaluru) May ’24 - Current
        ◦ ∗ Deployed LLMs on cloud platforms, implementing AWS Lambda functions, S3, Bedrock, and SageMaker for
        seamless data processing and model deployment.
        ∗ Engineered collaborative AI systems using LangChain & Langraph, developing agentic workflow architectures for
        innovative lead generation solutions and multi-agent systems.
        ∗ Implemented Retrieval-Augmented Generation (RAG) systems to enhance LLM performance with external
        knowledge.
        ∗ Developed an advanced lead emailing system using Mixture of Agents (MoA) techniques, integrating multiple
        state-of-the-art open-source LLMs.
        • Larsen & Toubro Defence— Machine Learning Intern (Remote) Feb ’24 - Aug ’24
        ◦ Predictive Maintenance System for Propulsion Systems:
        ∗ Conducted a detailed requirement analysis for predictive maintenance in propulsion systems, studying operational
        parameters, failure modes, and maintenance needs.
        ∗ Executed data cleaning and preprocessing workflows, applying some techniques like Random Forests, Gradient
        Boosting Machines (GBM), and time-series analysis for predictive maintenance. This enabled accurate prediction of
        equipment failures and optimization of maintenance schedules, improving operational efficiency.
        ∗ Designed a comprehensive data collection framework with integrated sensors and data logging.
        Projects
        • InsightifySeven: AI-Web Extension for YouTube:
        ◦ Leveraged React components to create a seamless and dynamic user experience in the web extension, achieving a
        remarkable 94% accuracy in transcribing videos across 30+ languages and extracting comments from 95% of
        YouTube videos, coupled with sentiment analysis to visualize user sentiments on a 0-100% scale.
        ◦ Deployed topic modeling to identify 6-14 topics with 85% coherence, generated summaries with 70% length
        reduction and 88% coherence, and performed 1-hour video analysis in 3 minutes with comprehensive insights.
        • ClipSurf Project: AI-Driven Video Content Discovery Engine:
        ◦ Utilized Next.js alongside Neon Postgres DB and Prisma as the ORM for robust data management. Authentication
        was seamlessly handled through OAuth, while user session management leveraged industry-standard practices such
        as JWT (JSON Web Tokens) and secure cookie-based sessions for enhanced security and scalability.
        ◦ Implemented advanced NLP methodologies, including topic modeling and Latent Dirichlet Allocation (LDA),
        enabling the platform to process and analyze over 400 paragraph-length queries per day, extracting accurate
        keywords for video content search.
        ◦ Successfully integrated with different video platform APIs, achieving a curated content retrieval success rate of 95%
        within seconds, significantly enhancing user experience by providing relevant and diverse video content.
        Research Work & Certifications
        • Performance Analysis of Various DL Models in Lung Cancer Detection...— Under Progress ()
        • Natural Language Processing for developers— Infosys Springboard (November - December 2023)
        Skills
        • Programming Languages: Python, C++, JavaScript, Node.js, Express.js, React, SQL
        • Frameworks and Technologies: Flask, Scikit-Learn, TensorFlow, NLTK, SpaCy, Gensim, OpenCV, LangChain,
        AWS EC2, AWS Lambda, GCP Apprunner, Cloudflare Workers, Docker, FastAPI, Keras, Streamlit, Apache Spark,
        Airflow, Redux, Next.js
        • Version Control: Git, GitHub, Gitpod
        • Machine Learning and AI: Natural Language Processing (NLP), Computer Vision, Deep Learning with TensorFlow
        and Keras, Time-Series Analysis
        • Software Development Practices: Microservices architecture, CI/CD pipelines with Kafka, Containerization with
        Docker and Kubernetes, Serverless architecture
        • Databases: PostgreSQL, MongoDB, MySQL, Redis
        • Operating Systems: Linux Systems (Ubuntu, CentOS), Windows
        • Mathematics: Linear Algebra, Statistics, Probability, Calculus
        Extra Curricular
        • Photographer: iClick: Photography Club, Ramaiah Institute of Technology.
        • Graphic Designer: TEDxMSRIT, Ramaiah Institute of Technology.
        • NSS Member: Member & Volunteer, Ramaiah Institute of Technology.
        Link: mailto:chitransh0210@gmail.com
        Link: https://www.linkedin.com/in/chitransh-srivastava-37b0a0225/
        Link: https://github.com/ChitranshS
        Link: https://twitter.com/chtzzzzzex
        Link: https://github.com/ChitranshS/SummaView-Youtube-Extension/tree/main
        Link: https://clip-surf.vercel.app


        Project Details:
        The SummaView YouTube Extension enhances the YouTube experience by offering video summarization, transcript extraction, and comment sentiment analysis, providing users with a quick grasp of video content and community reactions. Built with NLP tools like spaCy, NLTK, and Gensim, it generates summaries and sentiment scores, helping users bypass lengthy videos and comment sections while still accessing valuable insights.
        Additionally, the extension includes topic modeling, which identifies trending subjects in comments, offering content creators and viewers a clear view of audience interests. Its intuitive UI, built with JavaScript and CSS, integrates these tools directly into YouTube, allowing easy access to data without disrupting the viewing experience.
        
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
                - You have to return the output strictly in markdown format. The markdown also should highlight the important information in the resume.It should also be structured in a way that is easy to read and understand.
                - If the user is asking for information in detail then only give long responses else keep them short to improve the user experience and conversation. 
        """



        model = ChatTogether(model="google/gemma-2-27b-it" , temperature=0.5 , api_key = os.getenv("TOGETHER_API_KEY"))
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