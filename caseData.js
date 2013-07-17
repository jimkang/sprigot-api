var caseDataSource = {
  id: 'discovery',
  name: 'Discovery',
  text: 'Last September, I discovered that a friend of mine, \'A\', had been arrested.',
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
};
