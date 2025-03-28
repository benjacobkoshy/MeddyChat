from rasa_sdk import Action
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.events import SlotSet
import google.generativeai as genai
from rasa_sdk import Tracker
from typing import List
import requests


# Initialize conversation history
conversation_history = []  # Stores only the last 5 messages

class ActionGeminiChat(Action):
    def name(self):
        return "action_gemini_chat"

    def run(self, dispatcher, tracker, domain):
        global conversation_history
        user_message = tracker.latest_message.get("text")

        # Maintain limited conversation history (last 5 messages)
        conversation_history.append(f"User: {user_message}")
        if len(conversation_history) > 10:  # Limit to last 5 messages
            conversation_history.pop(0)

        # Call Gemini AI
        gemini_response = call_gemini_api(conversation_history, user_message)

        # Append AI response to history
        conversation_history.append(f"Bot: {gemini_response}")

        # Send response back to user
        dispatcher.utter_message(text=gemini_response)
        return []


def call_gemini_api(history: List[str], user_message: str) -> str:
    """
    Calls Gemini API for medical diagnosis, ensuring context handling.
    """
    try:
        structured_query = f"""
        You are a medical AI chatbot assisting users with symptom-based diagnosis.
        Here is the recent conversation:

        {history[-10:]}  # Only sending last 5 messages for clarity

        New user input: "{user_message}"

        Respond with:
        - **Diagnose** if symptoms match a known condition.  
        - If unclear, **ask for specific missing symptoms**.  
        - **Avoid repetition** and irrelevant details.  
        - **Urgent cases** (e.g., stroke, heart attack) → Advise immediate medical help.  
        - Keep responses **brief and medically relevant**.  
        """


        # Configure Gemini API
        genai.configure(api_key="AIzaSyCo9OcrTk0h53dc115oJpjaJY7A4rUHK_o")
        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content(structured_query)

        if response and response.text:
            return response.text.strip()
        else:
            return "I'm not entirely sure. Would you like to consult a doctor?"
    except Exception as e:
        print(f"Error calling Gemini API: {e}")
        return "I'm having trouble connecting to Gemini. Please try again later."



from rasa_sdk.events import SlotSet, AllSlotsReset
import requests

# BACKEND_URL = "https://benjacobkoshy.pythonanywhere.com"
BACKEND_URL = "http://192.168.24.32:8000"



class FetchUserData(Action):
    def name(self):
        return "action_fetch_user_data"

    def run(self, dispatcher, tracker, domain):
        user_id = tracker.sender_id  # Get the dynamically assigned user ID

        # Reset all slots to prevent data overlap from previous users
        reset_events = [AllSlotsReset()]

        url = f"{BACKEND_URL}/chatBot/user-details/?user_id={user_id}"

        try:
            response = requests.get(url, timeout=5)
            response.raise_for_status()

            user_data = response.json()
            if not user_data:
                dispatcher.utter_message("No user data found.")
                return reset_events

            name = user_data.get("name", "User")
            gender = user_data.get("gender", "Unknown")
            medical_history = user_data.get("medical_history", [])
            previous_diagnoses = user_data.get("previous_diagnoses", [])

            return reset_events + [
                SlotSet("user_name", name),
                SlotSet("user_gender", gender),
                SlotSet("medical_history", medical_history),
                SlotSet("previous_diagnoses", previous_diagnoses),
            ]

        except requests.exceptions.RequestException:
            dispatcher.utter_message("Error connecting to the server.")
            return reset_events




import requests
import logging
import urllib.parse
from typing import Any, Dict, List, Text
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.events import SlotSet

# Set up logging
logger = logging.getLogger(__name__)

class ActionFetchDoctors(Action):

    def name(self) -> str:
        return "action_fetch_doctors"

    def run(self, dispatcher, tracker, domain):
        specialization = tracker.get_slot("specialization")
        print(f"Specialization from chatbot: {specialization}")  # Debugging

        response = requests.get(f"{BACKEND_URL}/chatBot/get-doctors/?specialization={specialization}")

        if response.status_code == 200:
            doctors = response.json()

            if doctors:  # Ensure there are doctors before responding
                buttons = []
                doctor_list = []

                for doc in doctors:
                    doctor_list.append(f"{doc['name']} ({doc['specialization']})")
                    buttons.append({
                        "title": f"Dr. {doc['name']} ({doc['specialization']})",
                        "payload": f'/select_doctor{{"doctor_name": "{doc["name"]}", "doctor_id": "{doc["id"]}"}}'
                    })

                doctor_str = ", ".join(doctor_list)

                dispatcher.utter_message(
                    # text=f"Here are the available doctors: {doctor_str}. Please select one:",
                    text=f"Here are the available doctors: \n Please select one:",
                    buttons=buttons
                )
            else:
                dispatcher.utter_message(text="Sorry, no doctors are available for this specialization at the moment.")

        elif response.status_code == 404:
            data = response.json()
            if "error" in data:
                dispatcher.utter_message(text=data["error"])
            else:
                dispatcher.utter_message(text="No doctors found. Please check the specialization name and try again.")

        else:
            dispatcher.utter_message(text="Error fetching doctor details. Please try again later.")

        return []


class ActionRedirectToDoctorInterface(Action):
    def name(self) -> Text:
        return "action_redirect_to_doctor_interface"

    def run(self, dispatcher, tracker, domain):
        doctor_name = tracker.get_slot("doctor_name")
        doctor_list = tracker.get_slot("doctor_list") or []
        doctor_dict = tracker.get_slot("doctor_dict") or {}

        if not doctor_name:
            dispatcher.utter_message(text="Please provide the doctor's name.")
            return []

        if not doctor_list:
            dispatcher.utter_message(text="No available doctors. Please fetch the doctor list again.")
            return []

        # Normalize doctor name (remove "Dr." and lowercase)
        doctor_name_cleaned = doctor_name.replace("Dr.", "").strip().lower()

        if doctor_name_cleaned not in doctor_dict:
            dispatcher.utter_message(text=f"Doctor {doctor_name} is not in the available list. Please select again.")
            return []

        doctor_id = doctor_dict[doctor_name_cleaned]
        formatted_doctor_name = f"Dr. {doctor_name.title()}"

        # Generate deep link for React Native
        doctor_slug = urllib.parse.quote(doctor_name_cleaned.replace(" ", "-"))  # Safe encoding
        deep_link = f"{BACKEND_URL}/appointment/{doctor_slug}"

        dispatcher.utter_message(
            text=f"Appointment scheduling has started with {formatted_doctor_name}.",
            buttons=[{"title": "Book Appointment", "payload": f"/book_appointment{{\"doctor_name\": \"{doctor_name}\"}}"}]
        )

        return [SlotSet("doctor_name", formatted_doctor_name), SlotSet("doctor_id", doctor_id)]
