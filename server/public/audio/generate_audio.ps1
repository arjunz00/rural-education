Add-Type -AssemblyName System.Speech
$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
$synth.Rate = 0

$lessons = @{
    'class1_phonics_alphabet.wav' = 'Welcome to Class 1 English Phonics. Let us learn letter sounds. A is for Ant, a a ant. B is for Bird, b b bird. C is for Cow, c c cow. D is for Dog, d d dog. In our village, listen to the rooster in the morning: cock a doodle doo! The goat says: meh meh. The cow says: moo moo. Practice these sounds every day!'
    'class2_english_rhymes.wav'   = 'Class 2 English nursery rhyme. Rain on the green grass, rain on the sugarcane field, rain on the school rooftop, but not upon me! Rain, rain, go away, little farmer wants to play. Clean rainwater fills our village well today.'
    'class4_math_tables.wav'      = 'Class 4 Mathematics. Multiplication tables and fast mental math. Two times two is four. Two times three is six. Two times four is eight. Three times three is nine. Four times four is sixteen. Five times five is twenty-five. Six times six is thirty-six. Seven times seven is forty-nine. Eight times eight is sixty-four. Nine times nine is eighty-one. Ten times ten is one hundred. Repeat these rhythmic tables daily to calculate village market prices quickly!'
    'class6_science_earth.wav'     = 'Class 6 Science. Planetary orbits, day and night cycle. Earth rotates on its tilted axis every twenty-four hours, giving our village sunrise, daytime, and night. Earth revolves around the Sun once every three hundred and sixty-five days, bringing the monsoon, winter, and summer harvesting seasons.'
    'class7_science_nutrition.wav' = 'Class 7 General Science. Nutrition in plants and animals. Green plants are autotrophs. They make their own food through photosynthesis using sunlight, water from soil, and carbon dioxide from the air. The green pigment chlorophyll captures solar energy. Animals and humans are heterotrophs because they depend on plants and other animals for food. Keep village farm soil healthy with compost to grow nutritious food!'
    'class8_english_reading.wav'  = 'Class 8 English Reading Fluency. The Wise Farmer of Dahiwadi. Once upon a time in a drought-prone village, an old farmer taught his children the value of perseverance. While others waited idly for rain, he dug trenches, mulched the black soil, and planted native banyan trees. When the gentle monsoon rains arrived, his fields retained every drop of moisture, while barren fields washed away. Moral: Wisdom and daily labor turn dry soil into fertile green fields.'
    'class9_civics_panchayat.wav' = 'Class 9 Social Science. Village Panchayat and Local Governance. The Gram Panchayat is the grassroots foundation of Indian democracy. It consists of the Sarpanch, Ward Members, and the Gram Sevak. It manages drinking water supply, road repairs, street lighting, and village primary school maintenance. Every citizen above 18 years is a member of the Gram Sabha, which approves the village development budget and social audit.'
    'class10_english_grammar.wav' = 'Class 10 English Grammar. Active and Passive Voice revision. In active voice, the subject performs the action: The teacher graded the examination papers. In passive voice, the object becomes the focus: The examination papers were graded by the teacher. Always use the past participle verb form in passive voice.'
}

$audioDir = $PSScriptRoot
foreach ($key in $lessons.Keys) {
    $outPath = Join-Path $audioDir $key
    $synth.SetOutputToWaveFile($outPath)
    $synth.Speak($lessons[$key])
    Write-Host "Generated: $key"
}

$synth.Dispose()

# Also copy as .mp3 files so both extensions exist on disk
foreach ($key in $lessons.Keys) {
    $base = [System.IO.Path]::GetFileNameWithoutExtension($key)
    $wavPath = Join-Path $audioDir $key
    $mp3Path = Join-Path $audioDir ($base + '.mp3')
    Copy-Item $wavPath $mp3Path -Force
    Write-Host "Created mirror: $($base + '.mp3')"
}
