var caseDataSource = {
  id: "notonline",
  title: "Not online.",
  body: "<p>A friend of mine, 'N', had not been online in quite some time. He hadn't responded to texts or calls, either. I assumed that he had gone on vacation to some place where his phone was no good.</p><p>At some point, I saw in Messages that our last chat had been almost a month ago.</p>",
  children: [
    {
      id: "awkwardness",
      title: "Awkward asking",
      body: "<p>Not knowing anyone else that did not primarily communicate with him online like I did, I considered calling his family. That would be awkward, though, as I had not talked to them in decades.</p><p>I imagine similar uncertainty and awkwardness happens to people in missing persons situations. If you go to great lengths to find someone, and it turns out they're not missing, you look like a fool. But if they are, and you delay in action, you are endangering them.</p><p>I go through a minature of this dilemma when my wife is late coming home and her phone is dead.</p>"
    },
    {
      id: "googling",
      title: "Google: No need to talk!",
      body: "I found a way out of having to call someone. I Googled N's name and the area he lived in. And I found out where he was.",
      children: [
        {
          id: "localnews",
          title: "Local news web sites",
          body: "There were several hits on local news web sites, and web sites that aggregated and copied content from local news web sites. He had been arrested by the DEA and was being held in jail.",
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
    }
  ]
};
