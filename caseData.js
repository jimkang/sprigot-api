var caseDataSource = {
  id: 'notonline',
  name: 'Not online.',
  text: 'A friend of mine, \'N\', had not been online in quite some time. He hadn\'t responded to texts or calls, either. I assumed that he had gone on vacation somewhere. At some point, I saw in Messages that our last chat had been almost a month ago.',
  children: [
    {
      id: 'awkwardness',
      name: 'Awkward asking',
      text: '<p>Not knowing anyone else that knew him that also did not primarily communicate with him online, I considered calling his family. That would be awkward, though, as I had not talked to them in decades.</p><p>I imagine similar uncertainty and awkwardness happens to people in missing persons situations. If you go to great lengths to find someone, and it turns out they\'re not missing, you look like a fool.</p><p>But if they are, and you delay in action, you are endangering them. I\'ve gone through micro versions of this the few times I haven\'t been able to get in touch with my wife for a few hours.</p>'
    },
    {
      id: 'googling',
      name: 'Google: No need to talk!',
      text: 'I tried Googling N\'s name with the area he lived in. And there it was.',
      children: [
        {
          id: 'thecase',
          name: 'The Case',
          text: 'He was charged with stuff. They had a tip about plant growing equipment in a derelict storage space.',
          children: [
            {
              id: 'charges',
              name: 'Charges',
              text: 'He was charged with the manufacture of a controlled substance.',
            },
            {
              id: 'feds',
              name: 'The Feds',
              text: 'The feds watched him for nine months.',
              children: [
                {
                  id: 'money',
                  name: 'Money',
                  text: 'How much did that cost?',
                  children: [
                    {
                      name: 'What else could have been done with that money?',
                      text: 'Feed four families for a year?'
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
