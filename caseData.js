var caseDataSource = {
  name: 'root',
  text: 'Last September, I discovered that a friend of mine, \'A\', had been arrested.',
  rect: {
    x: 50,
    y: 10,
    width: 300,
    height: 300,
    fill: 'gray'
  },
  children: [
    {
      name: 'theCase',
      text: 'He was charged with stuff. They had a tip about plant growing equipment in a derelict storage space.',
      rect: {
        x: 70,
        y: 400,
        width: 300,
        height: 300,
        fill: 'green'
      },
      children: [
        {
          name: 'charges',
          text: 'He was charged with the manufacture of a controlled substance.',
          rect: {
            x: 440,
            y: 800,
            width: 300,
            height: 300,
            fill: 'red'
            },
            group: {
              id: 'charges'
            },
            outbound: [
            ]
        },
        {
          name: 'feds',
          text: 'The feds watched him for nine months.',
          rect: {
            x: 450,
            y: 400,
            width: 300,
            height: 300,
            fill: 'red',
          }
        }
      ]
    }
  ]
};
