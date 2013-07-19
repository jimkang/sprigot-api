var caseDataSource = {
  id: "notonline",
  title: "Not online",
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
          body: "<p>There were several hits on local news web sites, as well as web sites that aggregated and copied content from local news web sites. They all said the same thing, but I clicked on all of them.</p><p>He had been arrested by the DEA and was being held in jail for the manufacture of marijuana with the intent to distribute.</p><p>They had pictures of him being led from his home by law enforcement. My friend C found video footage of N being walked out and big weed plants being brought out of the house, trophy-style. It was surreal.</p>",
          children: [
            {
              id: "dopeonthetable",
              title: "Dope on the table",
              body: "<p>Since crappy local TV news was there, no doubt they were invited by the DEA or local police. They said they pulled out over 500 plants, and articles gave an astronomical 'street value,' which I later learned were inflated for drama.</p>"
            },
            {
              id: "charge",
              title: "The charge",
              body: "<p>Most of the reporting was simply printing whatever the police wanted to say, as well as reaction quotes from the neighbors. Not incredibly useful. However, they did post the criminal complaint, which had a wealth of reliable information.</p><p>N's charge was Manufacturing a Schedule I Controlled Substance, in violation of Title 21 United States Code, Sections 841(a)(1) and 841(b)(l)(B). It says that if the violation involves<blockquote>100 kilograms or more of a mixture or substance containing a detectable amount of marihuana, or 100 or more marihuana plants regardless of weight</blockquote><blockquote>...such person shall be sentenced to a term of imprisonment which may not be less than 5 years and not more than 40 years...</blockquote>The charge was for over 500 plants, so he was well above 100. An affidavit was attached to the complaint. It went through the smooth moves the DEA conducted to build a case for a warrant.</p>",
              children: [
                {
                  id: "mandatoryminimum",
                  title: "Mandatory minimum",
                  body: "<p>A minimum of five years in prison for growing marijuana is insane.</p><p>First, the principle of the mandatory minimum is stupid. Judges are highly trained and selected at great effort. Mandatory minimum laws toss that highly honed judgery aside for a few lines of <a href=\"https://en.wikipedia.org/wiki/Conditional_(computer_programming)#If.E2.80.93then.28.E2.80.93else.29\">if-then-else code</a>.</p><p>There's an organization called ALEC, the American Legislative Exchange Council, that writes \"model bills\" for legislators. Its corporate sponsors include Corrections Corporation of America (CCA). One of ALEC's model bills was mandatory minimum sentences. <a href=\"http://americanradioworks.publicradio.org/features/corrections/laws1.html\">Much more here.</a></p><p>And then there is the sheer ridiculousness of being imprisoned for FIVE YEARS for growing weed. In fact, any jail time at all is ridiculous. There is zero jail time for making and selling your own alcohol.</p>"
                },
                {
                  id: "investigation",
                  title: "Investigation",
                  body: "<p>According to the affidavit, the DEA started the case about two years before the arrest. The manager of a storage facility (which I looked up and appears to be sheds behind a private home) busted into storage units because of unpaid rent and found a bunch of indoor marijuana growing equipment - grow lamps, plastic swimming pools, pots, etc.</p><p>They traced the renters to a business, and one of the owners of that business had a Facebook account. That Facebook account had pictures of the guy with pot plants.</p><p>They also traced the license plate of a van that came to pick the equipment up a few days later to someone we'll call Z, Sr. No connection to N, at this point.</p>",
                  children: [
                    {
                      id: "wall",
                      title: "Someone's wall",
                      body: "<p>There's a lot that bothers me about this Facebook connection. First, how incredibly stupid of this idiotic fool to post pictures of himself with pot plants, knowing what he's got in his storage unit, to Facebook. Even if you limit access to immediate friends, what's to stop them from talking? And if you are not concerned with your own freedom, what about that of your associates?</p><p>More importantly, how did law enforcement get into his Facebook pictures? I think it's possible, but highly unlikely that those photos were completely public. Did they get a subpoena? There's no mention of it in the affidavit, which you'd think there'd be.</p>",
                      children: [
                        {
                          id: "facebook",
                          title: "Facebook and you",
                          body: "<p>There's a <a href=\"http://blog.thephoenix.com/BLOGS/phlog/archive/2012/04/06/when-police-subpoena-your-facebook-information-heres-what-facebook-sends-cops.aspx\">Boston Phoenix post</a> on what Facebook gives law enforcement when they subpoena accounts. In that case, they handed over \"text printouts of Markoff's wall posts, photos he uploaded as well as photos he was tagged in, a comprehensive list of friends with their Facebook IDs, and a long table of login and IP data.\" Facebook went above and beyond, returning not only IPs and timestamps but also the URLs requested.</p><p>I find it disturbing that these Facebook demands require only the authorization of the district attorney, unlike a wiretap, which requires a judge's approval and specifics on what you're trying to capture. Yet the information that Facebook hands over is far more comprehensive and invasive.</p>"
                        },
                        {
                          id: "nukeit",
                          title: "Nuking my content",
                          body: "<p>I was disgusted by Facebook's role in this, both as a tool and as a company. I never want to accidentally end up a link in a chain that fucks up good people for no reason. So, I decided to nuke all of my content there. I had already stopped posting to it a little while ago, but I had left my stuff up.</p><p>I know it's likely that nothing is truly deleted there – just marked as deleted. Still, I want to make it hard as I can for entities tapping into Facebook and for Facebook itself to exploit any information I may have offered.</p><p>I wrote a set of Python scripts that used their Graph API to delete whatever I could. Their API is wonky, but I persisted until I got it. I know it wasn't entirely rational, and not a platonically optimal use of my time, but it felt right.</p>"
                        }
                      ]
                    },
                    {
                      id: "concernedcitizen",
                      title: "Concerned citizen",
                      body: "A year and a half after the storage facility incident, a 'concerned citizen' called to complain about one of his neighbors, who happened to be N. He complained that N's house smelled weird. His other complaints were that N was never outside, and no lights were ever on inside his house, except for possibly some screens.</p><p>They had not connected this complaint to the storage locker, yet, <i>this complaint was enough</i> for them to start investigating the property.",
                      children: [
                        {
                          id: "garbageandmail",
                          title: "Garbage, mail, and bills",
                          body: "<p>Law enforcement started by looking through property records and his garbage and mail, which I guess is legal, as long as they don't open the mail. Through the mail, they were able to connect N to a person we'll call, Z, Jr., who is related to the aforementioned Z, Sr.</p><p>Then, they started <i>three months</i> of surveillance. Eventually, they got N's electric bills which were high and characteristic of the cost of operating lots of indoor growing lamps.</p><p>That, along with another chat with Concerned Citizen, plus the connections to the Zs, got them their warrant.</p>",
                          children: [
                            {
                              id: "nothingtohide",
                              title: "Nothing to hide?",
                              body: "<p>Let's consider for a moment, the implications of the police digging through the garbage and mail of everyone that is reported to be weird and unlike the other people in the neighborhood. Let's say you think that marijuana is the scourge of mankind, even. Supposing that, they struck gold in this case.</p><p>But what if there were something about you that caught the eye of your neighborhood busybody? Would it be fair for the police and some agency to start digging through your garbage because someone made a specious complaint about you? If so, should we then all live our lives as though someone might start going through our garbage and mail?</p><p>If your answer is \"I have nothing to hide\", maybe you should start with telling me where you live, and we can see if you have nothing to hide?</p><p>(I'm mostly just kidding, as I don't have time to provide you with personal Stasi service, but I hope that for a moment, you thought I wasn't.)</p>",
                            }
                          ]
                        }
                      ]
                    }
                  ]
                }                
              ]
            },
            {
              id: "comments",
              title: "Read the comments?",
              body: "<p>Surprisingly, 100% of the comments were not of the \"these deadbeat criminals are ruining our country THANKS OBAMA\" nature. Instead, in various levels of articulation, they all questioned the cost and value of arrests, raids, and investigations like this.</p><p>When I went back to the search results, I found that legalization advocacy web sites regularly spider out and link to these stories, pouring a payload of pro-weed people onto local news sites. So, like the racist and misogynist comments you may see on any other article, these can't be counted as reprsentative of the people.</p><p>However, months later, I read about Josh Rosenthal's (the quasi-famous mixed martial arts referee) similar arrest for growing marijuana. The comments on MMA web sites, which are not known for being particularly thoughtful or liberal, were also largely questioning the point of such federal efforts.</p>"
            }            
          ]
        }
      ]
    }
  ]
};
