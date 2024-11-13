
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

load_dotenv()

model = ChatTogether(model="google/gemma-2-27b-it" , temperature=0 , api_key = os.getenv("TOGETHER_API_KEY"))

from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import START, MessagesState, StateGraph
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage

class ChatState(MessagesState):
    should_end: bool
    task_determined: str
    state_variables: list
# Define the function that calls the model
def call_model(state: ChatState):
  
    system_prompt = ("You are a helpful AI assistant.")
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
memory = MemorySaver()
def chat_subgraph_wrapper(user_input):
    app = workflow.compile(checkpointer=checkpointer)
    init_state = ChatState(
        messages=user_input,
    )
    config = {"configurable": {"thread_id": "testing123"}}
    for state in app.stream(init_state,config):
            obj = {"inner_messages":state['model']['messages']}
                # pass
            return obj
            
# Example usage
# while True:
#      user_input = input("Enter your message: ")
#      if user_input.lower() == "exit":
#          break
#      message = chat_subgraph_wrapper(user_input=user_input)
#      print(message['inner_messages'][-1].content)
 #chat_subgraph_wrapper(thread_id_provider="123",user_input="hello")
# print(final_task[-1])