export type Template = {
  id: string;
  name: string;
  price: number; // in main currency units (INR)
  description: string;
  content: any;
};

export const TEMPLATES: Template[] = [
  {
    id: "customer-survey",
    name: "Customer Satisfaction Survey",
    price: 199, // INR
    description: "A simple flow to collect customer satisfaction and feedback.",
    content: {
      nodes: [
        { id: "start", type: "start", label: "Start" },
        { id: "q1", type: "question", label: "How satisfied are you?" },
        { id: "q2", type: "question", label: "Any comments?" },
        { id: "end", type: "end", label: "Thanks" },
      ],
      edges: [
        { from: "start", to: "q1" },
        { from: "q1", to: "q2" },
        { from: "q2", to: "end" },
      ],
    },
  },
  {
    id: "onboarding-flow",
    name: "User Onboarding Flow",
    price: 299,
    description: "Guide new users through a personalized onboarding experience.",
    content: {
      nodes: [
        { id: "start", type: "start", label: "Welcome" },
        { id: "step1", type: "question", label: "What brings you here?" },
        { id: "end", type: "end", label: "Finish" },
      ],
      edges: [{ from: "start", to: "step1" }, { from: "step1", to: "end" }],
    },
  },
];
