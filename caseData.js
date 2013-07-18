var caseDataSource = {
  id: "notonline",
  title: "Not online.",
  body: "A friend of mine, 'N', had not been online in quite some time. He hadn't responded to texts or calls, either. I assumed that he had gone on vacation somewhere. At some point, I saw in Messages that our last chat had been almost a month ago.",
  children: [
    {
      id: "awkwardness",
      title: "Awkward asking",
      body: "<p>Not knowing anyone else that knew him that also did not primarily communicate with him online, I considered calling his family. That would be awkward, though, as I had not talked to them in decades.</p><p>I imagine similar uncertainty and awkwardness happens to people in missing persons situations. If you go to great lengths to find someone, and it turns out they're not missing, you look like a fool.</p><p>But if they are, and you delay in action, you are endangering them. I've gone through micro versions of this the few times I haven't been able to get in touch with my wife for a few hours.</p>"
    },
    {
      id: "googling",
      title: "Google: No need to talk!",
      body: "I tried Googling N's name with the area he lived in. And there it was.",
      children: [
        {
          id: "thecase",
          title: "The Case",
          body: "He was charged with stuff. They had a tip about plant growing equipment in a derelict storage space.",
          children: [
            {
              id: "charges",
              title: "Charges",
              body: "He was charged with the manufacture of a controlled substance.",
            },
            {
              id: "feds",
              title: "The Feds",
              body: "The feds watched him for nine months.",
              children: [
                {
                  id: "money",
                  title: "Money",
                  body: "How much did that cost?",
                  children: [
                    {
                      title: "What else could have been done with that money?",
                      body: "Feed four families for a year?"
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  ]
};
