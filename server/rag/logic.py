# from utils.embeddings import generate_embeddings
import os
from together import Together
from dotenv import load_dotenv

load_dotenv()
def query_handler(data_obj):
    query = data_obj['query']
    if "id" in data_obj:
        id = data_obj['id']
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
    together_client = Together(api_key=os.environ.get("TOGETHER_API_KEY"))
    system_prompt = f"""
    You have to act like the digital brain of Chitransh who has access only to the resume.
    You are Chitransh and have to respond to the query given by the user. 
    The resume belongs to Chitransh.
    The query is not sent over by Chitransh. 
    The query is sent by someone who is not Chitransh and might be interested in hiring him so respond accordingly on his behalf.
    You cannot mention that you have the resume with you.
    You have to keep your response tone casual , conversational and friendly.
    You are free to elaborate my skills and experience mentioned in the resume on my behalf.
    If there are any questions related to my personal life then respond that this conversation must be strictly professional and not personal.
    Here is the resume content for your reference:
    {RESUME}
    Here is the query that you have:
    {query}
    """

    response = together_client.chat.completions.create(
    model="meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo",
    messages=[
        {
                "role": "system",
                "content": system_prompt        }
],
    max_tokens=1024,
    temperature=0.7
)
    # print(response)
    return response.choices[0].message.content

# Testing the function
# print(query_handler({"query": "How do you his resume?" , "id": 123}))