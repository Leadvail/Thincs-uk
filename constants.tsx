
import { CommandSkill, CommandSkillName, Rating } from './types';

export const RATINGS: Rating[] = [
  { value: "4", label: "Good", description: "Performance was consistently high/exemplary" },
  { value: "3", label: "Satisfactory", description: "Performance was acceptable but with room for improvement" },
  { value: "2", label: "Marginal", description: "Performance was inconsistent and unacceptable with improvement required in specific areas" },
  { value: "1", label: "Poor", description: "Performance was cause for concern with substantial improvement required" },
  { value: "0", label: "Unobserved", description: "Omission to perform skill may have endangered the lives of firefighters and/or dangerously allowed the incident to escalate; serious remediation required" },
  { value: "NO", label: "Not Observed", description: "Skill/sub skill not observed as it did not apply to the context" }
];

export const COMMAND_SKILLS: CommandSkill[] = [
  {
    name: CommandSkillName.Leadership,
    description: "Leads by example and coordinates activities across different teams on the incident ground; sets standards and monitors performance accordingly; values others and adapts leadership style according to them or the situation; champions safety leadership to ensure others observe safe working systems and behaviours.",
    color: "blue",
    subSkills: [
      {
        id: 1,
        name: "Setting and Maintaining Standards of Performance",
        goodPractice: [
          "Sets clear objectives for tasks/roles to be achieved within realistic timescales based on appropriate use of operational guidance",
          "Demonstrates accountability for decisions by taking responsibility for subsequent actions",
          "Reinforces standards of performance by praising and encouraging good performance and intervening to correct poor performance",
          "Monitors the performance of tasks or roles to ensure completed in accordance with expectations",
          "Ensures accurate records maintained about the incident and their command"
        ],
        poorPractice: [
          "Applies inappropriate operational guidance and/or sets unrealistic timescales",
          "Seeks to detach themselves from decisions that led to poor performance outcomes - blames others or external factors",
          "Fails to establish/maintain standards of performance and/or behaviour",
          "Surprised by actions taken unilaterally by others outside of expectations",
          "Fails to ensure accurate records maintained"
        ]
      },
      {
        id: 2,
        name: "Values and Supports Others",
        goodPractice: [
          "Treats others with respect and courtesy and challenges inappropriate behaviour",
          "Motivates by providing development opportunities",
          "Inspires by encouraging innovation and/or empowering others to achieve objectives/tasks",
          "Acknowledges concerns of others"
        ],
        poorPractice: [
          "Acts disrespectfully towards others and fails to intervene to manage inappropriate behaviour",
          "Misses opportunities to develop others",
          "Micromanages the performance of tasks or roles",
          "Ignores concerns of others",
          "Fails to take account of the emotional state of others"
        ]
      },
      {
        id: 3,
        name: "Leadership Style",
        goodPractice: [
          "Issues direct orders and instructions in time-pressured situations",
          "Uses correct level of authority when dealing with others",
          "Asserts position when necessary",
          "Adapts style according to perceived situation and the competence/experience of personnel"
        ],
        poorPractice: [
          "Fails to react to critical demands of situation",
          "Asserts authority inappropriately when dealing with others - the ‘my way is the only way’ approach",
          "Acts passively when others should have been challenged",
          "Adopts an inappropriate leadership style compared to the situation or competence/experience of personnel"
        ]
      },
      {
        id: 4,
        name: "Competence",
        goodPractice: [
          "Introduces knowledge and experience when briefing/debriefing in relation to the completion of a task/role or when transferring command",
          "Provides explanations to justify and support point of view and references knowledge and experience",
          "References knowledge and experience when making decisions",
          "Coaches inexperienced firefighters/officers during performance of a task or role"
        ],
        poorPractice: [
          "Demonstrates a lack of understanding of role/appliance or equipment capabilities, or health and safety issues/legal implications",
          "Fails to justify and support point of view with explanations",
          "Fails to provide reasons behind decisions",
          "Overlooks opportunities to coach inexperienced personnel during performance of a task or role"
        ]
      },
      {
        id: 5,
        name: "Safety Leadership",
        goodPractice: [
          "Concentrates on the processes used to achieve tasks not the outcomes – process not outcomes oriented",
          "Communicates safety expectations/information at the incident",
          "Ensures firefighter maxim observed at all times",
          "Establishes a safety officer/sector in a timely manner"
        ],
        poorPractice: [
          "Fails to establish safe systems of work before taking action",
          "Omits to share their safety expectations/information at the incident",
          "Authorises by act or omission unsafe actions or behaviours to take place",
          "Neglects to establish a safety officer/sector when necessary"
        ]
      }
    ]
  },
  {
    name: CommandSkillName.DecisionMaking,
    description: "Utilises the appropriate decision making process based on the situation and draws on the support of others to resolve problems and inform decision making; decides upon and implements a plan in accordance with declared priorities.",
    color: "green",
    subSkills: [
      {
        id: 1,
        name: "Intuitive Decision Making",
        goodPractice: [
          "Responds to cues in the environment and makes quick decisions validated by the decision control process",
          "Dynamically risk assesses the situation and correctly declares tactical mode",
          "Balances risks to be taken with appropriate safety measures"
        ],
        poorPractice: [
          "Delays inappropriately making a decision until more information available",
          "Declares incorrect tactical mode",
          "Exposes resources to unacceptable risks"
        ]
      },
      {
        id: 2,
        name: "Analytical Decision Making",
        goodPractice: [
          "Defines operational problems and requirements",
          "Consults operational guidance, risk and other technical information",
          "Generates options for decisions based on risk assessment and discusses pros and cons of each one",
          "Makes a decision based on optimum option and validates it using the decision control process",
          "Gives orders and instructions to implement decision"
        ],
        poorPractice: [
          "Fails to define problems",
          "Ignores operational guidance, risk and other technical information",
          "Acts upon first option; does not consider alternatives",
          "Makes a decision without being able to explain the rationale behind it and/or applies inappropriate operational guidance that increases risk to personnel",
          "Fails to effectively communicate decision to others"
        ]
      },
      {
        id: 3,
        name: "Planning",
        goodPractice: [
          "Prioritises tasks/objectives and details their corresponding actions and timeframes to others",
          "Allocates resources in a timely manner in accordance with the plan's priorities and makes up if needed",
          "Establishes a timeline of anticipated future events as a baseline against which to measure progress",
          "Reviews the decisions underpinning the plan to ensure they remain current and adapts the plan when necessary"
        ],
        poorPractice: [
          "Fails to prioritise tasks/objectives or explain the plan to others",
          "Fails to allocate available/sufficient resources",
          "Fails to provide informative messages in a timely manner",
          "Fails to review their plan or adapt it when necessary"
        ]
      }
    ]
  },
  {
    name: CommandSkillName.Communication,
    description: "Ensures all relevant information is effectively received, communicated and understood and the transfer of command facilitates shared situational awareness between commanders.",
    color: "amber",
    subSkills: [
      {
        id: 1,
        name: "Listening",
        goodPractice: [
          "Permits others to speak without interruption",
          "Questions others specifically about the information/concerns they have shared",
          "Reacts appropriately to the emotions of others",
          "Maintains eye contact and attention on others when they are speaking"
        ],
        poorPractice: [
          "Talks over the contributions of other speakers",
          "Communicates judgementally with a speaker",
          "Fails to respond to the feelings that underlie a speaker's concerns/information",
          "Fails to pay attention to a speaker due to distractions"
        ]
      },
      {
        id: 2,
        name: "Communication Style",
        goodPractice: [
          "Adopts a supportive, friendly style when information gathering",
          "Adopts an assertive style in pressurised situations to convey urgency",
          "Communicates concisely in plain English and matches non-verbal and verbal communication"
        ],
        poorPractice: [
          "Adopts an antagonistic style when trying to gather information",
          "Fails to communicate with sufficient force when dealing with an urgent situation",
          "Communication is peppered with fire and rescue service terminology and acronyms"
        ]
      },
      {
        id: 3,
        name: "Briefing",
        goodPractice: [
          "Selects suitable locations to conduct briefings",
          "Conducts briefings in a structured manner and includes priorities and objectives",
          "Optimises the briefing time and content to ensure individuals/teams have a shared understanding of the incident and what is required of them",
          "Utilises technical and pictorial information to aid briefing",
          "Encourages questions and comments to ensure shared understanding of feedback and learning/about the incident and their role/tasks",
          "Ensures briefings and critical information are recorded and communicated as necessary"
        ],
        poorPractice: [
          "Conducts briefings at locations subject to compromising distractions",
          "Conducts unstructured briefings",
          "Fails to contextualise or adequately detail role/tasks to ensure shared understanding with unfamiliar/unknown colleagues",
          "Ignores technical/pictorial information",
          "Fails to provide opportunities for questions and comments",
          "Fails to identify key learning points",
          "Fails to record or communicate transfer of command completed",
          "Omits to record or communicate critical information as necessary"
        ]
      }
    ]
  },
  {
    name: CommandSkillName.Resilience,
    description: "Manages pressure and physical demands and creates thinking time to aid planning, problem solving and decision making.",
    color: "cyan",
    subSkills: [
      {
        id: 1,
        name: "Thinking Time",
        goodPractice: [
          "Requests 'quiet' at the command location",
          "Creates a barrier to distractions or physically removes self away from them",
          "Allocates appropriate command tasks to create time to think",
          "Maintains appropriate spans of control to effectively manage workload"
        ],
        poorPractice: [
          "Fails to control the distractions at the command location",
          "Fails to control others wishing to communicate, jeopardising the successful transfer of critical information",
          "Becomes overloaded as fails to delegate roles and work appropriately",
          "Becomes distracted and fails to respond to critical information and act in a timely manner"
        ]
      },
      {
        id: 2,
        name: "Stress and Fatigue Management",
        goodPractice: [
          "Remains calm, provides reassurance, and maintains concentration when under pressure",
          "Accepts offers of support during periods of high workload or uncertainty",
          "Ensures sufficient resources available to support their command",
          "Maintains levels of hydration and nourishment to sustain performance"
        ],
        poorPractice: [
          "Raises voice inappropriately due to work overload",
          "Becomes overwhelmed by responsibilities/situation and focuses on one area of operations/command",
          "Fails to complete a task or communication due to work overload or distractions",
          "Forgets to carry out a future, pre-planned action due to high workload",
          "Overlooks opportunities to eat and drink"
        ]
      },
      {
        id: 3,
        name: "Confidence",
        goodPractice: [
          "Articulates instructions, needs, and questions clearly when under pressure",
          "Tackles challenges willingly and takes acceptable risks",
          "Acknowledges mistakes",
          "Projects a positive attitude during discussions"
        ],
        poorPractice: [
          "Fails to communicate coherently under pressure",
          "Avoids taking acceptable risks and resorts to familiar courses of action",
          "Tries to cover up mistakes",
          "Undermines confidence in their command by complaining about the actions/decisions of colleagues during discussions"
        ]
      }
    ]
  },
  {
    name: CommandSkillName.Awareness,
    description: "Identifies and maintains overall awareness of the incident including key hazards, risks and operational activities; understands them and anticipates how the incident may develop.",
    color: "pink",
    subSkills: [
      {
        id: 1,
        name: "Information Gathering",
        goodPractice: [
          "Scans the scene of operations to monitor the situation",
          "Dictates command support and layout of information to meet their individual needs",
          "Asks people questions proactively and requests relevant information focused on need, priorities and risks"
        ],
        poorPractice: [
          "Overlooks monitoring the scene of operations due to distractions",
          "Fails to change the command support or layout of information to meet their individual needs",
          "Fails to orientate themselves to the situation during the handover of command"
        ]
      },
      {
        id: 2,
        name: "Understanding Information",
        goodPractice: [
          "Seeks and provides updates routinely to confirm accuracy of own mental model and that of others",
          "Discusses or cross-checks information to identify gaps/assumptions or interpret its importance and impact on their mental model",
          "Interprets information from technical support systems"
        ],
        poorPractice: [
          "Misses opportunities to get updates from, and fails to update, others",
          "Fails to discuss information - reacts to individual cues without understanding their relationship",
          "Omits to make use of technical support systems"
        ]
      },
      {
        id: 3,
        name: "Anticipating Incident Developments",
        goodPractice: [
          "Reviews adequacy of resources at the scene and explains how they may be used to meet future needs",
          "Evaluates the effectiveness of current operations and discusses contingency plans",
          "Anticipates the impact of the incident upon people/businesses in the local area and their subsequent needs",
          "Ensures the public are provided with relevant information in support of their safety/need for information via appropriate media channels"
        ],
        poorPractice: [
          "Authorises an inappropriate course of action with available resources",
          "Surprised by a predictable development of the situation",
          "Fails to take account of the incident’s impact on people/businesses in the local area",
          "Avoids briefing the media"
        ]
      }
    ]
  },
  {
    name: CommandSkillName.Teamwork,
    description: "Forms a team and engages in teamwork to manage team dynamics on the incident ground and ensures team members and others are valued and have shared situational awareness.",
    color: "emerald",
    subSkills: [
      {
        id: 1,
        name: "Cooperation",
        goodPractice: [
          "Accepts advice/support",
          "Integrates the actions of different teams across the incident ground using the principles of JESIP when necessary",
          "Compromises over actions to be taken when appropriate",
          "Provides information to others in support of their operations"
        ],
        poorPractice: [
          "Ignores advice/support",
          "Causes conflict between different teams on the incident ground",
          "Fails to coordinate actions with others",
          "Omits to provide information requested by others"
        ]
      },
      {
        id: 2,
        name: "Team Formation",
        goodPractice: [
          "Matches role/tasks to strengths and experience of individuals whenever possible",
          "Develops operational activities/command team based on priorities",
          "Provides clear guidance and direction to team members in response to questions",
          "Explains the relationships between team members"
        ],
        poorPractice: [
          "Fails to check if individual can cope with role/task",
          "Develops operational activities/command team in an ad hoc manner",
          "Ignores the questions of team members",
          "Fails to explain how the task/role of one team member impacts upon another"
        ]
      },
      {
        id: 3,
        name: "People Oriented",
        goodPractice: [
          "Steps in to offer advice/support when needed",
          "Establishes a rapport with others to generate effective working relationships - encourages contributions from others",
          "Provides constructive criticism and/or feedback"
        ],
        poorPractice: [
          "Fails to notice others unable to cope with their role or task",
          "Dismisses the contributions and concerns raised by others in support of their command",
          "Fails to provide constructive feedback"
        ]
      }
    ]
  }
];

export const UK_FIRE_SERVICES = [
  "Avon Fire and Rescue Service",
  "Bedfordshire Fire and Rescue Service",
  "Buckinghamshire Fire and Rescue Service",
  "Cambridgeshire Fire and Rescue Service",
  "Cheshire Fire and Rescue Service",
  "Cleveland Fire Brigade",
  "Cornwall Fire and Rescue Service",
  "County Durham and Darlington Fire and Rescue Service",
  "Cumbria Fire and Rescue Service",
  "Derbyshire Fire and Rescue Service",
  "Devon and Somerset Fire and Rescue Service",
  "Dorset and Wiltshire Fire and Rescue Service",
  "East Sussex Fire and Rescue Service",
  "Essex County Fire and Rescue Service",
  "Gloucestershire Fire and Rescue Service",
  "Greater Manchester Fire and Rescue Service",
  "Hampshire and Isle of Wight Fire and Rescue Service",
  "Hereford and Worcester Fire and Rescue Service",
  "Hertfordshire Fire and Rescue Service",
  "Humberside Fire and Rescue Service",
  "Kent Fire and Rescue Service",
  "Lancashire Fire and Rescue Service",
  "Leicestershire Fire and Rescue Service",
  "Lincolnshire Fire and Rescue Service",
  "London Fire Brigade",
  "Merseyside Fire and Rescue Service",
  "Mid and West Wales Fire and Rescue Service",
  "Norfolk Fire and Rescue Service",
  "North Yorkshire Fire and Rescue Service",
  "North Wales Fire and Rescue Service",
  "Northamptonshire Fire and Rescue Service",
  "Northern Ireland Fire and Rescue Service",
  "Northumberland Fire and Rescue Service",
  "Nottinghamshire Fire and Rescue Service",
  "Oxfordshire Fire and Rescue Service",
  "Royal Berkshire Fire and Rescue Service",
  "Scottish Fire and Rescue Service",
  "Shropshire Fire and Rescue Service",
  "South Wales Fire and Rescue Service",
  "South Yorkshire Fire and Rescue Service",
  "Staffordshire Fire and Rescue Service",
  "Suffolk Fire and Rescue Service",
  "Surrey Fire and Rescue Service",
  "Tyne and Wear Fire and Rescue Service",
  "Warwickshire Fire and Rescue Service",
  "West Midlands Fire Service",
  "West Sussex Fire and Rescue Service",
  "West Yorkshire Fire and Rescue Service"
];
